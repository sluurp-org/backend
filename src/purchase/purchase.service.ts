import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PortoneService } from 'src/portone/portone.service';
import { EventStatus, Prisma, PurchaseStatus } from '@prisma/client';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class PurchaseService {
  private readonly MAX_RETRY_COUNT = 3; // 재결제 최대 시도 횟수
  private readonly RETRY_INTERVAL_DAYS = 1; // 재결제 시도 간격 (1일)
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly portoneService: PortoneService,
    private readonly telegramService: TelegramService,
  ) {}

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

  public async findPurchaseHistory(
    workspaceId: number,
    query: PurchaseHistoryQueryDto,
  ) {
    const { skip, take } = query;

    return this.prismaService.purchaseHistory.findMany({
      where: {
        workspaceId,
        status: { notIn: [PurchaseStatus.READY, PurchaseStatus.PAY_PENDING] },
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
        status: { notIn: [PurchaseStatus.READY, PurchaseStatus.PAY_PENDING] },
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

  public async createPurchase() {
    const workspaces = await this.prismaService.workspace.findMany({
      where: { deletedAt: null, nextPurchaseAt: { lte: new Date() } },
    });

    const config = await this.prismaService.config.findUnique({
      where: { id: 1 },
    });
    if (!config) {
      throw new NotFoundException('설정 정보를 찾을 수 없습니다.');
    }

    const { defaultPrice, alimtalkSendPrice, contentSendPrice } = config;

    for (const workspace of workspaces) {
      const nextPurchaseAt = new Date(workspace.nextPurchaseAt);
      nextPurchaseAt.setMonth(nextPurchaseAt.getMonth() + 1);
      nextPurchaseAt.setHours(0, 0, 0, 0);

      await this.prismaService.workspace.update({
        where: { id: workspace.id },
        data: { nextPurchaseAt },
      });

      await this.prismaService.$transaction(async (transaction) => {
        const eventHistories = await transaction.eventHistory.findMany({
          where: { workspaceId: workspace.id, status: EventStatus.SUCCESS },
          include: { messageTemplate: true },
        });

        const billing = await transaction.workspaceBilling.findUnique({
          where: { workspaceId: workspace.id },
        });

        // 금액 계산 후 오름차순 정렬
        const purchasePrice = eventHistories
          .reduce((acc, cur) => {
            let price = alimtalkSendPrice;
            if (cur.messageTemplate.contentGroupId) price += contentSendPrice;

            acc.push(price);
            return acc;
          }, [])
          .sort((a, b) => a - b);

        const discountAmount = purchasePrice
          .slice(0, 100)
          .reduce((acc, cur) => acc + cur, 0);

        const amount =
          purchasePrice.reduce((acc, cur) => acc + cur, 0) + defaultPrice;

        if (!billing) {
          this.logger.error(
            `워크스페이스(${workspace.id})에 결제 정보가 없습니다.`,
          );

          return;
        }
        const freeTrialAvailable = await this.isFreeTrialAvailable(
          workspace.id,
        );

        if (freeTrialAvailable) {
          const purchase = await transaction.purchaseHistory.create({
            data: {
              workspaceId: workspace.id,
              billingId: billing.id,
              amount,
              discountAmount: amount,
              totalAmount: 0,
              reason: '한달 무료체험',
              status: PurchaseStatus.PAID,
            },
          });

          return purchase;
        }

        const purchase = await transaction.purchaseHistory.create({
          data: {
            workspaceId: workspace.id,
            billingId: billing.id,
            amount,
            discountAmount,
            totalAmount: amount - discountAmount,
            reason: '스르륵 메세지 발송비용 청구',
            status: PurchaseStatus.READY,
          },
        });

        const { billingKey } = billing;
        const { id: paymentKey, totalAmount } = purchase;
        const { name: workspaceName, id: workspaceId } = workspace;

        try {
          const purchasedAt = await this.portoneService.requestPayment(
            paymentKey,
            billingKey,
            {
              orderName: '스르륵 발송 후불 청구',
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
          this.logger.error(error);
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

      // TODO: 메일 발송

      return false;
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
