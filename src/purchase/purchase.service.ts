import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PortoneService } from 'src/portone/portone.service';
import { Config, EventStatus, Prisma, PurchaseStatus } from '@prisma/client';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class PurchaseService {
  private readonly MAX_RETRY_COUNT = 3; // 재결제 최대 시도 횟수
  private readonly RETRY_INTERVAL_DAYS = 2; // 재결제 시도 간격 (2일)
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly portoneService: PortoneService,
    private readonly telegramService: TelegramService,
  ) {}

  public async getConfig() {
    return this.prismaService.config.findUnique({
      where: { id: 1 },
    });
  }

  public async getPurchase(workspaceId: number) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace)
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

    const config = await this.prismaService.config.findUnique({
      where: { id: 1 },
    });
    if (!config) throw new NotFoundException('설정 정보를 찾을 수 없습니다.');

    const { lastPurchaseAt, nextPurchaseAt } = workspace;
    const purcahse = await this.calculatePurchasePrice(
      workspaceId,
      config,
      lastPurchaseAt,
      nextPurchaseAt,
    );

    return {
      ...purcahse,
      nextPurchaseAt,
    };
  }

  public async purchaseReuqest(workspaceId: number, purchaseId: string) {
    const purchase = await this.prismaService.purchaseHistory.findUnique({
      where: { id: purchaseId, workspaceId },
    });
    if (!purchase) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    const { status } = purchase;

    const successedPurchaseStatus = [
      'PAID',
      'CANCELLED',
      'PARTIAL_CANCELLED',
      'VIRTUAL_ACCOUNT_ISSUED',
    ];
    if (successedPurchaseStatus.includes(status))
      throw new NotAcceptableException('이미 결제가 완료되었습니다.');

    const billing = await this.prismaService.workspaceBilling.findUnique({
      where: { workspaceId },
    });
    if (!billing)
      throw new NotFoundException(
        '결제 정보를 찾을 수 없습니다. 결제 정보를 등록해주세요.',
      );

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        const purchaseHistory = await transaction.purchaseHistory.update({
          where: { id: purchaseId },
          data: { status: PurchaseStatus.READY },
          include: { workspace: true },
        });

        const { billingKey } = billing;
        const {
          id: paymentKey,
          workspace: { name: workspaceName, id: workspaceId },
          scheduledId,
          totalAmount,
        } = purchaseHistory;

        if (!totalAmount || totalAmount === 0)
          return await transaction.purchaseHistory.update({
            where: { id: purchaseId },
            data: { status: PurchaseStatus.PAID, purchasedAt: new Date() },
          });

        const purchasedAt = await this.portoneService.requestPayment(
          paymentKey,
          billingKey,
          {
            orderName: '스르륵 메세지 발송비용 청구',
            ordererId: workspaceId.toString(),
            ordererName: workspaceName,
            amount: totalAmount,
          },
        );

        if (scheduledId) {
          try {
            await this.portoneService.cancelScheduledPayment({
              scheduleIds: [scheduledId],
            });
          } catch (error) {
            this.logger.error(error);

            await this.telegramService.sendMessage({
              fetal: true,
              context: PurchaseService.name,
              workspaceId,
              error,
              message: `예약된 결제 취소에 실패했습니다. - ${purchaseId}`,
            });

            throw new NotAcceptableException(
              '예약된 결제 취소에 실패했습니다.',
            );
          }
        }

        return await transaction.purchaseHistory.update({
          where: { id: purchaseId },
          data: { status: PurchaseStatus.PAID, purchasedAt },
        });
      });
    } catch (error) {
      await this.prismaService.purchaseHistory.update({
        where: { id: purchaseId },
        data: { status: PurchaseStatus.FAILED },
      });

      throw new InternalServerErrorException('결제 요청에 실패했습니다.');
    }
  }

  public async findBilling(workspaceId: number) {
    return this.prismaService.workspaceBilling.findUnique({
      where: { workspaceId },
    });
  }

  public async upsertBilling(workspaceId: number, dto: CreateBillingBodyDto) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId, deletedAt: null },
    });
    if (!workspace)
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

    const billingExists = await this.prismaService.workspaceBilling.findUnique({
      where: { workspaceId },
    });
    if (billingExists)
      throw new NotAcceptableException('이미 등록된 결제 정보가 있습니다.');

    const {
      number,
      expiryYear,
      expiryMonth,
      birthOrBusinessRegistrationNumber,
      passwordTwoDigits,
    } = dto;
    const billingKeyResponse = await this.portoneService.createBillingKey(
      number,
      expiryYear,
      expiryMonth,
      birthOrBusinessRegistrationNumber,
      passwordTwoDigits,
      JSON.stringify({
        workspaceId: workspaceId.toString(),
        workspaceName: workspace.name,
      }),
    );

    const maskedCardNumber = dto.number.replace(/\d{4}(?=\d{4})/g, '**** ');

    const billing = await this.prismaService.workspaceBilling.create({
      data: {
        workspaceId,
        billingKey: billingKeyResponse,
        cardNumber: maskedCardNumber,
      },
    });

    return billing;
  }

  public async deleteBilling(workspaceId: number) {
    try {
      return await this.prismaService.$transaction(async (transaction) => {
        const billing = await transaction.workspaceBilling.findUnique({
          where: { workspaceId },
        });
        if (!billing) return;

        await this.portoneService.deleteBillingKey(billing.billingKey);
        return await transaction.workspaceBilling.delete({
          where: { id: billing.id },
        });
      });
    } catch (err) {
      this.logger.error(err);
      await this.telegramService.sendMessage({
        fetal: true,
        workspaceId,
        context: PurchaseService.name,
        error: err,
        message: `결제 정보 삭제에 실패했습니다.`,
      });

      throw new NotAcceptableException('결제 정보 삭제에 실패했습니다.');
    }
  }

  public async findPurchaseHistory(
    workspaceId: number,
    query: PurchaseHistoryQueryDto,
  ) {
    const { skip, take } = query;

    return this.prismaService.purchaseHistory.findMany({
      where: {
        workspaceId,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async countPurchaseHistory(workspaceId: number) {
    return this.prismaService.purchaseHistory.count({
      where: {
        workspaceId,
      },
    });
  }

  public async isFreeTrialAvailable(workspaceId: number) {
    const purchaseHistory = await this.prismaService.purchaseHistory.findFirst({
      where: { workspaceId, status: PurchaseStatus.PAID },
    });

    if (!purchaseHistory) return true;
    return false;
  }

  public async calculatePurchasePrice(
    workspaceId: number,
    config: Config,
    lastPurchaseAt: Date,
    nextPurchaseAt: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const { defaultPrice, alimtalkSendPrice, contentSendPrice } = config;
    const freeTrialAvailable = await this.isFreeTrialAvailable(workspaceId);

    const eventHistories = await transaction.eventHistory.findMany({
      where: {
        workspaceId,
        status: EventStatus.SUCCESS,
        processedAt: { gte: lastPurchaseAt, lt: nextPurchaseAt },
      },
      include: { contents: true },
    });

    // 금액 계산 후 오름차순 정렬
    const purchasePrice = eventHistories
      .reduce<{ isContentSend: boolean; price: number }[]>((acc, cur) => {
        let price = alimtalkSendPrice;
        if (cur.contents.length > 0)
          price += contentSendPrice * cur.contents.length;

        acc.push({
          isContentSend: cur.contents.length > 0 ? true : false,
          price,
        });

        return acc;
      }, [])
      .sort((a, b) => a.price - b.price);

    const amount = purchasePrice.reduce((acc, cur) => acc + cur.price, 0);
    if (amount === 0)
      return {
        freeTrialAvailable,
        noPurchase: true,
        contentSendCount: 0,
        alimtalkSendCount: 0,
        amount: 0,
        discountAmount: 0,
        totalAmount: 0,
        ...config,
      };

    const defaultAmount = defaultPrice + amount;

    const discountAmount = freeTrialAvailable
      ? defaultAmount
      : purchasePrice.slice(0, 100).reduce((acc, cur) => acc + cur.price, 0);

    const totalAmount = freeTrialAvailable ? 0 : defaultAmount - discountAmount;

    const contentSendCount = purchasePrice.filter(
      (item) => item.isContentSend,
    ).length;
    const alimtalkSendCount = purchasePrice.length;

    return {
      freeTrialAvailable,
      noPurchase: false,
      contentSendCount,
      alimtalkSendCount,
      amount: defaultAmount,
      discountAmount,
      totalAmount,
      ...config,
    };
  }

  public async createPurchase() {
    const workspaces = await this.prismaService.workspace.findMany({
      where: { deletedAt: null, nextPurchaseAt: { lte: new Date() } },
    });

    const config = await this.prismaService.config.findUnique({
      where: { id: 1 },
    });
    if (!config) {
      await this.telegramService.sendMessage({
        fetal: true,
        context: PurchaseService.name,
        message: `설정 정보를 찾을 수 없습니다.`,
      });
      throw new NotFoundException('설정 정보를 찾을 수 없습니다.');
    }

    const { alimtalkSendPrice, contentSendPrice } = config;

    for (const workspace of workspaces) {
      const { lastPurchaseAt, nextPurchaseAt } = workspace;

      const newNextPurchaseAt = new Date(nextPurchaseAt);
      newNextPurchaseAt.setDate(newNextPurchaseAt.getDate() + 30);

      await this.prismaService.workspace.update({
        where: { id: workspace.id },
        data: {
          nextPurchaseAt: newNextPurchaseAt,
          lastPurchaseAt: nextPurchaseAt,
        },
      });

      await this.prismaService.$transaction(async (transaction) => {
        const {
          freeTrialAvailable,
          noPurchase,
          contentSendCount,
          alimtalkSendCount,
          amount,
          discountAmount,
          totalAmount,
        } = await this.calculatePurchasePrice(
          workspace.id,
          config,
          lastPurchaseAt,
          nextPurchaseAt,
          transaction,
        );

        const createPurchaseRecepit: Prisma.RecepitCreateInput = {
          workspace: { connect: { id: workspace.id } },
          contentSendCount,
          alimtalkSendCount,
          alimtalkPrice: alimtalkSendPrice,
          contentPrice: contentSendPrice,
          amount,
          discountAmount,
          totalAmount,
        };

        if (totalAmount === 0 || freeTrialAvailable || noPurchase) {
          return await transaction.purchaseHistory.create({
            data: {
              workspace: { connect: { id: workspace.id } },
              amount: 0,
              discountAmount: 0,
              totalAmount: 0,
              reason: '스르륵 메세지 발송비용 청구',
              status: PurchaseStatus.PAID,
              recepit: {
                create: createPurchaseRecepit,
              },
            },
          });
        }

        const billing = await transaction.workspaceBilling.findUnique({
          where: { workspaceId: workspace.id },
        });

        if (!billing) {
          await transaction.purchaseHistory.create({
            data: {
              workspace: { connect: { id: workspace.id } },
              amount,
              discountAmount,
              totalAmount,
              reason: '스르륵 메세지 발송비용 청구',
              status: PurchaseStatus.FAILED,
              recepit: {
                create: {
                  workspace: { connect: { id: workspace.id } },
                  contentSendCount,
                  alimtalkSendCount,
                  alimtalkPrice: alimtalkSendPrice,
                  contentPrice: contentSendPrice,
                  amount,
                  discountAmount,
                  totalAmount,
                },
              },
            },
          });

          await this.telegramService.sendMessage({
            fetal: true,
            context: PurchaseService.name,
            workspaceId: workspace.id,
            message: `결제 정보를 찾을 수 없습니다.`,
          });

          return;
        }

        const purchase = await transaction.purchaseHistory.create({
          data: {
            workspace: { connect: { id: workspace.id } },
            billing: { connect: { id: billing.id } },
            amount,
            discountAmount,
            totalAmount,
            reason: '스르륵 메세지 발송비용 청구',
            status: PurchaseStatus.READY,
            recepit: {
              create: createPurchaseRecepit,
            },
          },
        });

        const { billingKey } = billing;
        const { id: paymentKey } = purchase;
        const { name: workspaceName, id: workspaceId } = workspace;

        try {
          const purchasedAt = await this.portoneService.requestPayment(
            paymentKey,
            billingKey,
            {
              orderName: '스르륵 메세지 발송비용 청구',
              ordererId: workspaceId.toString(),
              ordererName: workspaceName,
              amount: totalAmount,
            },
            JSON.stringify({ retry: 0 }),
          );

          return await transaction.purchaseHistory.update({
            where: { id: purchase.id },
            data: {
              status: PurchaseStatus.PAID,
              purchasedAt,
            },
          });
        } catch (error) {
          this.prismaService.purchaseHistory.update({
            where: { id: purchase.id },
            data: { status: PurchaseStatus.FAILED },
          });

          await this.telegramService.sendMessage({
            fetal: true,
            context: PurchaseService.name,
            error,
            message: `결제 요청에 실패했습니다. - ${purchase.id}`,
          });

          throw new NotAcceptableException('결제 요청에 실패했습니다.');
        }
      });
    }
  }

  private async handleTransactionPaidWebhook(
    purchase: Prisma.PurchaseHistoryGetPayload<{
      include: { workspace: true };
    }>,
  ) {
    await this.telegramService.sendMessage({
      context: PurchaseService.name,
      workspaceId: purchase.workspaceId,
      message: `결제 완료: ${purchase.totalAmount}원`,
    });

    if (purchase.status === PurchaseStatus.PAID) return true;

    await this.prismaService.purchaseHistory.update({
      where: { id: purchase.id },
      data: { status: PurchaseStatus.PAID, purchasedAt: new Date() },
    });
    //TODO: 메일 발송

    return true;
  }

  private async handleTransactionFailedWebhook(
    purchase: Prisma.PurchaseHistoryGetPayload<{
      include: { workspace: true };
    }>,
    customData: string,
  ) {
    const { retry } = JSON.parse(customData);

    if (retry >= this.MAX_RETRY_COUNT) {
      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.FAILED },
      });

      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        workspaceId: purchase.workspaceId,
        message: `재결제 시도 횟수를 초과했습니다. (RetryCountExceeded)`,
        fetal: true,
      });

      // TODO: 메일 발송

      return true;
    }

    const nextRetry = new Date();
    nextRetry.setDate(nextRetry.getDate() + this.RETRY_INTERVAL_DAYS);
    nextRetry.setHours(15, 0, 0, 0);

    const retryCount = retry + 1;
    await this.prismaService.purchaseHistory.update({
      where: { id: purchase.id },
      data: {
        status: PurchaseStatus.READY,
        retry: retryCount,
      },
    });

    if (!purchase.billingId) {
      this.logger.error('결제 정보를 찾을 수 없습니다.');

      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        workspaceId: purchase.workspaceId,
        message: `결제 정보를 찾을 수 없습니다. (BillingKeyNotFound)`,
        fetal: true,
      });

      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.FAILED },
      });

      // TODO: 메일 발송

      return false;
    }

    const workspaceBilling =
      await this.prismaService.workspaceBilling.findUnique({
        where: { id: purchase.billingId },
      });
    if (!workspaceBilling) {
      this.logger.error('결제 정보를 찾을 수 없습니다.');

      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        workspaceId: purchase.workspaceId,
        message: `결제 정보를 찾을 수 없습니다. (BillingKeyNotFound)`,
        fetal: true,
      });

      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.FAILED },
      });

      // TODO: 메일 발송

      return false;
    }

    if (!purchase.totalAmount || purchase.totalAmount === 0) {
      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.PAID, purchasedAt: new Date() },
      });

      return true;
    }

    try {
      const scheduledId = await this.portoneService.requestScheduledPayment(
        purchase.id + retryCount,
        workspaceBilling.billingKey,
        nextRetry,
        {
          orderName: '스르륵 발송 후불 청구',
          ordererId: purchase.workspaceId.toString(),
          ordererName: purchase.workspace.name,
          amount: purchase.totalAmount,
        },
        JSON.stringify({ retry: retryCount }),
      );

      return await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { scheduledId },
      });
    } catch (error) {
      this.logger.error(error);
      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        workspaceId: purchase.workspaceId,
        error: error,
        message: `결제 요청에 실패했습니다. (RetryPaymentFailed) - ${purchase.id}`,
        fetal: true,
      });

      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.FAILED },
      });

      return true;
    }
  }

  public async handlePaymentWebhook(body: WebhookBodyDto) {
    const {
      type,
      data: { paymentId },
    } = body;

    if (!paymentId) {
      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        message: `결제 정보가 없습니다. (PaymentIdNotFound) - ${paymentId}`,
        fetal: true,
      });
      return true;
    }

    const purchase = await this.prismaService.purchaseHistory.findUnique({
      where: { id: paymentId },
      include: { workspace: true },
    });
    if (!purchase) {
      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        message: `결제 정보를 찾을 수 없습니다. (PurchaseHistoryNotFound) - ${paymentId}`,
        fetal: true,
      });
      return true;
    }

    const payment = await this.portoneService.getPayment(paymentId);
    if (!payment) {
      await this.telegramService.sendMessage({
        context: PurchaseService.name,
        message: `결제 정보를 가져오는데 실패했습니다. (PaymentInfoNotFound) - ${paymentId}`,
        fetal: true,
      });

      return true;
    }

    switch (type) {
      case WebhookTypeEnum.TransactionPaid:
        return this.handleTransactionPaidWebhook(purchase);
      case WebhookTypeEnum.TransactionFailed:
        return this.handleTransactionFailedWebhook(purchase, payment);
      default:
        return true;
    }
  }
}
