import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PortoneService } from 'src/portone/portone.service';
import {
  Benefit,
  BenefitType,
  Config,
  EventStatus,
  Prisma,
  PurchaseStatus,
} from '@prisma/client';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';
import { TelegramService } from 'src/telegram/telegram.service';
import { addDays } from 'date-fns';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { KakaoService } from 'src/kakao/kakao.service';

@Injectable()
export class PurchaseService {
  private readonly MAX_RETRY_COUNT = 3; // 재결제 최대 시도 횟수
  private readonly RETRY_INTERVAL_DAYS = 2; // 재결제 시도 간격 (2일)
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly kakaoService: KakaoService,
    private readonly prismaService: PrismaService,
    private readonly portoneService: PortoneService,
    private readonly telegramService: TelegramService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  public async getConfig() {
    return this.prismaService.config.findUnique({
      where: { id: 1 },
    });
  }

  public async getPurchase(workspaceId: number) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
      include: { workspaceBenefit: { include: { benefit: true } } },
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
      workspace.workspaceBenefit.map((benefit) => benefit.benefit),
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

    const billing = await this.prismaService.billing.findUnique({
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
            orderName: '스르륵 메시지 발송비용 청구',
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

      await this.telegramService.sendMessage({
        fetal: true,
        context: PurchaseService.name,
        workspaceId,
        error,
        message: `결제 요청에 실패했습니다. - ${purchaseId}`,
      });

      throw new InternalServerErrorException('결제 요청에 실패했습니다.');
    }
  }

  public async findBilling(workspaceId: number) {
    return this.prismaService.billing.findUnique({
      where: { workspaceId },
    });
  }

  public async upsertBilling(workspaceId: number, dto: CreateBillingBodyDto) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId, deletedAt: null },
    });
    if (!workspace)
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

    const billingExists = await this.prismaService.billing.findUnique({
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

    const billing = await this.prismaService.billing.create({
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
        const billing = await transaction.billing.findUnique({
          where: { workspaceId },
        });
        if (!billing) return;

        await this.portoneService.deleteBillingKey(billing.billingKey);
        return await transaction.billing.delete({
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

  private applyEffectiveBenefits(benefits: Benefit[]) {
    return benefits.reduce<Record<BenefitType, Benefit | null>>(
      (acc, benefit) => {
        if (!benefit.enabled) return acc;

        const existingBenefit = acc[benefit.type];
        if (!existingBenefit) {
          acc[benefit.type] = benefit;
        } else {
          switch (benefit.type) {
            case BenefitType.DISCOUNT_PERCENT:
            case BenefitType.DISCOUNT_AMOUNT:
              if (benefit.value > existingBenefit.value) {
                acc[benefit.type] = benefit;
              }
              break;
            case BenefitType.DEFAULT_PRICE:
              if (benefit.value < existingBenefit.value) {
                acc[benefit.type] = benefit;
              }
              break;
            default:
              break;
          }
        }

        return acc;
      },
      {
        [BenefitType.DISCOUNT_PERCENT]: null,
        [BenefitType.DISCOUNT_AMOUNT]: null,
        [BenefitType.DEFAULT_PRICE]: null,
      },
    );
  }

  public async calculatePurchasePrice(
    workspaceId: number,
    config: Config,
    lastPurchaseAt: Date,
    nextPurchaseAt: Date,
    benefits: Benefit[],
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

    let contentSendCount = 0;
    let alimtalkSendCount = 100;

    for (const event of eventHistories) {
      const contentCount = event.contents.length;

      contentSendCount += contentCount;
      alimtalkSendCount++;
    }

    const {
      [BenefitType.DEFAULT_PRICE]: defaultBenefit,
      [BenefitType.DISCOUNT_AMOUNT]: discountBenefit,
    } = this.applyEffectiveBenefits(benefits);

    if (
      (contentSendCount === 0 && alimtalkSendCount === 0) ||
      freeTrialAvailable
    ) {
      return {
        ...config,
        freeTrialAvailable,
        noPurchase: true,
        contentSendCount: 0,
        alimtalkSendCount: 0,
        amount: 0,
        discountAmount: 0,
        totalAmount: 0,
        defaultPrice: defaultBenefit?.value || defaultPrice,
      };
    }

    const defaultAmount = defaultBenefit?.value || defaultPrice;

    const alimtalkTotalPrice = alimtalkSendCount * alimtalkSendPrice;
    const contentTotalPrice = contentSendCount * contentSendPrice;
    const amount = alimtalkTotalPrice + contentTotalPrice + defaultAmount;

    const discountAlimtalkPrice =
      alimtalkSendCount <= 100
        ? alimtalkSendCount * alimtalkSendPrice
        : 100 * alimtalkSendPrice;

    const discountAmount = Math.min(
      amount,
      (discountBenefit?.value || 0) + discountAlimtalkPrice,
    );
    const totalAmount = Math.max(0, amount - discountAmount);

    if (totalAmount === 0) {
      return {
        ...config,
        freeTrialAvailable,
        noPurchase: true,
        contentSendCount,
        alimtalkSendCount,
        amount,
        discountAmount,
        totalAmount,
        defaultPrice: defaultBenefit?.value || defaultPrice,
      };
    }

    return {
      ...config,
      freeTrialAvailable,
      noPurchase: false,
      contentSendCount,
      alimtalkSendCount,
      amount,
      discountAmount,
      totalAmount,
      defaultPrice: defaultAmount,
    };
  }

  private async purchaseFailedAlert(workspaceId: number) {
    const targetWorkspace =
      await this.workspaceService.getWorkspaceOwners(workspaceId);
    if (!targetWorkspace) return;

    await this.kakaoService.sendKakaoMessage(
      targetWorkspace.workspaceUser.map(({ user }) => {
        return {
          to: user.phone,
          templateId: 'KA01TP241103121644900FMSV9Kpamdn',
          variables: {
            '#{고객명}': user.name,
            '#{워크스페이스명}': targetWorkspace.name,
            '#{워크스페이스아이디}': targetWorkspace.id,
          },
        };
      }),
    );
  }

  private async createPurchaseByWorkspace(
    workspace: Prisma.WorkspaceGetPayload<{
      include: {
        billing: true;
        workspaceBenefit: { include: { benefit: true } };
      };
    }>,
    config: Config,
  ): Promise<{
    purchaseId: string;
    status: PurchaseStatus;
    reason: string;
  }> {
    const result = await this.prismaService.$transaction(
      async (transaction) => {
        const { lastPurchaseAt, nextPurchaseAt } = workspace;

        const purchasePeriodStart =
          new Date(lastPurchaseAt) || new Date(workspace.createdAt);
        const purchasePeriodEnd =
          new Date(nextPurchaseAt) || addDays(lastPurchaseAt, 30);

        const newNextPurchaseAt = addDays(purchasePeriodEnd, 30);

        await this.prismaService.workspace.update({
          where: { id: workspace.id },
          data: {
            lastPurchaseAt: purchasePeriodEnd,
            nextPurchaseAt: newNextPurchaseAt,
          },
        });
        const {
          freeTrialAvailable,
          noPurchase,
          amount,
          discountAmount,
          totalAmount,
        } = await this.calculatePurchasePrice(
          workspace.id,
          config,
          purchasePeriodStart,
          purchasePeriodEnd,
          workspace.workspaceBenefit.map((benefit) => benefit.benefit),
          transaction,
        );

        if (totalAmount === 0 || noPurchase || freeTrialAvailable) {
          const createdPurchaseHistory =
            await transaction.purchaseHistory.create({
              data: {
                workspaceId: workspace.id,
                status: PurchaseStatus.PAID,
                amount: 0,
                totalAmount: 0,
                discountAmount: 0,
                reason: '스르륵 메시지 발송비용 청구',
              },
            });

          return {
            purchaseId: createdPurchaseHistory.id,
            status: createdPurchaseHistory.status,
            reason: '결제 없음',
          };
        }

        if (!workspace.billing) {
          const createdPurchaseHistory =
            await transaction.purchaseHistory.create({
              data: {
                workspaceId: workspace.id,
                status: PurchaseStatus.FAILED,
                amount,
                totalAmount,
                discountAmount,
                reason: '스르륵 메시지 발송비용 청구',
              },
            });

          return {
            purchaseId: createdPurchaseHistory.id,
            status: createdPurchaseHistory.status,
            reason: '결제 정보를 찾을 수 없습니다.',
          };
        }

        const purchaseHistory = await transaction.purchaseHistory.create({
          data: {
            workspaceId: workspace.id,
            billingId: workspace.billing.id,
            status: PurchaseStatus.READY,
            amount,
            totalAmount,
            discountAmount,
            reason: '스르륵 메시지 발송비용 청구',
          },
        });

        const { name: workspaceName, id: workspaceId, billing } = workspace;
        const { id: paymentKey } = purchaseHistory;
        const { billingKey } = billing;

        try {
          const purchasedAt = await this.portoneService.requestPayment(
            paymentKey,
            billingKey,
            {
              orderName: '스르륵 메시지 발송비용 청구',
              ordererId: workspaceId.toString(),
              ordererName: workspaceName,
              amount: totalAmount,
            },
          );

          const updatedPurchaseHistory =
            await transaction.purchaseHistory.update({
              where: { id: purchaseHistory.id },
              data: {
                status: PurchaseStatus.PAID,
                purchasedAt,
              },
            });

          return {
            purchaseId: updatedPurchaseHistory.id,
            status: updatedPurchaseHistory.status,
            reason: '결제 완료',
          };
        } catch (error) {
          const updatedPurchaseHistory =
            await transaction.purchaseHistory.update({
              where: { id: purchaseHistory.id },
              data: { status: PurchaseStatus.FAILED },
            });

          return {
            purchaseId: updatedPurchaseHistory.id,
            status: updatedPurchaseHistory.status,
            reason: '결제사측 결제 요청 실패',
          };
        }
      },
    );

    if (result.status === PurchaseStatus.FAILED) {
      throw new InternalServerErrorException(
        `결제 요청에 실패했습니다. - ${result.purchaseId}, ${result.reason}`,
      );
    }

    return result;
  }

  public async createPurchase() {
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

    const workspaces = await this.prismaService.workspace.findMany({
      where: { deletedAt: null, nextPurchaseAt: { lte: new Date() } },
      include: {
        billing: true,
        workspaceBenefit: {
          include: { benefit: true },
        },
      },
    });

    await Promise.allSettled(
      workspaces.map((workspace) =>
        this.createPurchaseByWorkspace(workspace, config),
      ),
    );
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

    return true;
  }

  private async handleTransactionFailedWebhook(
    purchase: Prisma.PurchaseHistoryGetPayload<{
      include: { workspace: true };
    }>,
  ) {
    const { retry } = purchase;

    if (retry > 0) await this.purchaseFailedAlert(purchase.workspace.id);
    if (retry >= this.MAX_RETRY_COUNT) {
      await this.prismaService.purchaseHistory.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.FAILED },
      });

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

      return false;
    }

    const billing = await this.prismaService.billing.findUnique({
      where: { id: purchase.billingId },
    });
    if (!billing) {
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
        billing.billingKey,
        nextRetry,
        {
          orderName: '스르륵 발송 후불 청구',
          ordererId: purchase.workspaceId.toString(),
          ordererName: purchase.workspace.name,
          amount: purchase.totalAmount,
        },
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
        return this.handleTransactionFailedWebhook(purchase);
      default:
        return true;
    }
  }
}
