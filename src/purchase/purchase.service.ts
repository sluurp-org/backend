import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PortoneService } from 'src/portone/portone.service';
import {
  Prisma,
  PurchaseHistory,
  PurchaseStatus,
  PurchaseType,
  SubscriptionModel,
  Workspace,
  WorkspaceBilling,
} from '@prisma/client';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { CreateCreditPurchaseOrderBodyDto } from './dto/req/create-credit-purchase-order-body.dto';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';

@Injectable()
export class PurchaseService {
  private readonly SUBSCRIPTION_DAYS = 30;
  private readonly FREE_TRIAL_DAYS = 30;
  private readonly MAX_RETRY_COUNT = 1;
  private readonly RETRY_HOUR = 2;
  private readonly EXPIRE_AFTER_DAYS = 365;
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly portoneService: PortoneService,
  ) {}

  private async updateWorkspaceReadonly(workspaceId: number) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.store.updateMany({
        where: { workspaceId },
        data: { readonly: true },
      });
      await tx.contentGroup.updateMany({
        where: { workspaceId },
        data: { readonly: true },
      });
      await tx.messageTemplate.updateMany({
        where: { workspaceId },
        data: { readonly: true },
      });
      await tx.workspace.update({
        where: { id: workspaceId },
        data: { subscriptionId: null, subscriptionEndedAt: null },
      });
    });
  }

  public async expiredWorkspaces() {
    const subsciprionExpiredWorkspaces =
      await this.prismaService.workspace.findMany({
        where: { subscriptionEndedAt: { lt: new Date() } },
      });
    if (subsciprionExpiredWorkspaces.length === 0) return [];

    await Promise.allSettled(
      subsciprionExpiredWorkspaces.map((workspace) =>
        this.updateWorkspaceReadonly(workspace.id),
      ),
    );
  }

  private async updateWorkspaceSubscription(
    workspaceId: number,
    subscriptionId: number,
    subscriptionEndedAt: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.workspace.update({
      where: { id: workspaceId },
      data: { subscriptionId, subscriptionEndedAt },
    });
  }

  private async updateWorkspaceLimits(
    workspaceId: number,
    subscription: SubscriptionModel,
    expiredAt: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const {
      contentLimit,
      messageLimit,
      storeLimit,
      isContentEnabled,
      isMessageEnabled,
    } = subscription;

    await Promise.allSettled([
      this.updateWorkspaceSubscription(
        workspaceId,
        subscription.id,
        expiredAt,
        transaction,
      ),
      this.updateContentReadonly(
        workspaceId,
        isContentEnabled,
        contentLimit,
        transaction,
      ),
      this.updateMessageReadonly(
        workspaceId,
        isMessageEnabled,
        messageLimit,
        transaction,
      ),
      this.updateStoreLimit(workspaceId, storeLimit, transaction),
    ]);
  }

  // 무료 평가판 불가능한지 확인
  public async isNotAvailableFreeTrial(
    workspaceId: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const subscription = await transaction.purchaseHistory.findFirst({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.PAID,
      },
    });

    return !!subscription;
  }

  // 현재 구독 조회
  private async currentSubscription(
    workspaceId: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const subscription = await transaction.purchaseHistory.findFirst({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.PAID,
        endedAt: { gte: new Date() },
      },
      orderBy: { endedAt: 'desc' },
      include: {
        subscription: true,
      },
    });

    return subscription;
  }

  // 다음 구독 조회
  private async nextSubscription(
    workspaceId: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const nextSubscription = await transaction.purchaseHistory.findFirst({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.READY,
        scheduledId: { not: null },
        startedAt: { gte: new Date() },
        endedAt: { gte: new Date() },
      },
      orderBy: { endedAt: 'desc' },
      include: {
        subscription: true,
      },
    });

    return nextSubscription;
  }

  // 무료 체험 생성
  private async createFreeTrial(
    workspaceId: number,
    subscription: SubscriptionModel,
    currentDate: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const freeTrialEndAt = new Date(currentDate);
    freeTrialEndAt.setDate(freeTrialEndAt.getDate() + this.FREE_TRIAL_DAYS + 1);
    freeTrialEndAt.setHours(0, 0, 0, 0);

    const { id: subscriptionId, name } = subscription;
    const freeTrialPurchase = await transaction.purchaseHistory.create({
      data: {
        workspaceId,
        subscriptionId,
        amount: 0,
        reason: '스르륵 ' + name + ' 구독 7일 평가판',
        purchasedAt: currentDate,
        startedAt: currentDate,
        endedAt: freeTrialEndAt,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.PAID,
      },
    });

    return freeTrialPurchase;
  }

  // 다음 구독 생성
  private async createNextSubscription(
    workspace: Workspace,
    subscription: SubscriptionModel,
    billing: WorkspaceBilling,
    startAt: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
    retry: number = 0,
  ) {
    const nextSubscriptionStartAt = new Date(startAt);
    const nextSubscriptionEndAt = new Date(nextSubscriptionStartAt);
    nextSubscriptionEndAt.setDate(
      nextSubscriptionEndAt.getDate() + 1 + this.SUBSCRIPTION_DAYS,
    );
    nextSubscriptionEndAt.setHours(0, 0, 0, 0);

    const {
      id: subscriptionId,
      name: subscriptionName,
      price: subscriptionPrice,
    } = subscription;
    const { id: billingId, billingKey } = billing;
    const { id: workspaceId, name: workspaceName } = workspace;

    const nextSubscription = await transaction.purchaseHistory.create({
      data: {
        workspaceId,
        billingId,
        subscriptionId,
        amount: subscriptionPrice,
        reason: '스르륵 ' + subscriptionName + ' 구독 결제',
        startedAt: nextSubscriptionStartAt,
        endedAt: nextSubscriptionEndAt,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.READY,
      },
    });

    const {
      id: nextPaymentKey,
      amount: nextPaymentAmount,
      reason: nextPaymentReason,
    } = nextSubscription;
    const nextPaymentScheduledId =
      await this.portoneService.requestScheduledPayment(
        nextPaymentKey,
        billingKey,
        nextSubscriptionStartAt,
        {
          amount: nextPaymentAmount,
          orderName: nextPaymentReason,
          ordererId: workspaceId.toString(),
          ordererName: workspaceName,
        },
        JSON.stringify({ retry }),
      );

    return await transaction.purchaseHistory.update({
      where: { id: nextPaymentKey },
      data: {
        scheduledId: nextPaymentScheduledId,
      },
    });
  }

  // 무료체험 종료 후 구독 생성
  private async createSubscriptionAfterFreeTrial(
    workspace: Workspace,
    subscription: SubscriptionModel,
    billing: WorkspaceBilling,
    currentDate: Date,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const { id: workspaceId, name: workspaceName } = workspace;
    const {
      id: subscriptionId,
      name: subscriptionName,
      price: subscriptionPrice,
    } = subscription;
    const { id: billingId, billingKey } = billing;

    const currentAvailableSubscription = await this.currentSubscription(
      workspaceId,
      transaction,
    );

    let lastEndedAt: Date = currentAvailableSubscription?.endedAt;
    let currentSubscription: PurchaseHistory = currentAvailableSubscription;
    if (!currentAvailableSubscription) {
      const thisMonthSubscriptionEndAt = new Date(currentDate);
      thisMonthSubscriptionEndAt.setDate(
        thisMonthSubscriptionEndAt.getDate() + 1 + this.SUBSCRIPTION_DAYS,
      );
      thisMonthSubscriptionEndAt.setHours(0, 0, 0, 0);

      const thisMonthSubscription = await transaction.purchaseHistory.create({
        data: {
          workspaceId,
          billingId,
          subscriptionId,
          amount: subscriptionPrice,
          reason: '스르륵 ' + subscriptionName + ' 구독 결제',
          purchasedAt: currentDate,
          startedAt: currentDate,
          endedAt: thisMonthSubscriptionEndAt,
          type: PurchaseType.SUBSCRIPTION,
          status: PurchaseStatus.READY,
        },
      });

      const {
        id: paymentKey,
        amount: paymentAmount,
        reason: paymentReason,
      } = thisMonthSubscription;
      const purchasedAt = await this.portoneService.requestPayment(
        paymentKey,
        billingKey,
        {
          amount: paymentAmount,
          orderName: paymentReason,
          ordererId: workspaceId.toString(),
          ordererName: workspaceName,
        },
      );

      await transaction.purchaseHistory.update({
        where: { id: paymentKey },
        data: {
          purchasedAt,
          status: PurchaseStatus.PAID,
        },
      });

      lastEndedAt = thisMonthSubscriptionEndAt;
      currentSubscription = thisMonthSubscription;
    }

    const nextSubscriptionStartAt = new Date(lastEndedAt);
    nextSubscriptionStartAt.setDate(nextSubscriptionStartAt.getDate() - 1);
    nextSubscriptionStartAt.setHours(13, 0, 0, 0);

    await this.createNextSubscription(
      workspace,
      subscription,
      billing,
      nextSubscriptionStartAt,
      transaction,
    );

    await this.updateWorkspaceLimits(
      workspaceId,
      subscription,
      currentAvailableSubscription.endedAt,
      transaction,
    );

    return currentSubscription;
  }

  public async calculateWorkspaceAdditionalPayment(
    workspaceId: number,
    subscriptionId: number,
  ) {
    const currentSubscription = await this.currentSubscription(workspaceId);
    if (!currentSubscription)
      throw new NotFoundException('현재 구독 정보를 찾을 수 없습니다.');

    if (currentSubscription.amount === 0) return 0;

    const updatedSubscription =
      await this.prismaService.subscriptionModel.findUnique({
        where: { id: subscriptionId },
      });
    if (!updatedSubscription)
      throw new NotFoundException('변경할 구독 정보를 찾을 수 없습니다.');

    const { subscription } = currentSubscription;
    const { price: subscriptionPrice } = subscription;
    const { price: updatedSubscriptionPrice } = updatedSubscription;

    const currentDate = new Date();
    const usedDays = Math.floor(
      (currentDate.getTime() - currentSubscription.startedAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return this.calculateAdditionalPayment(
      subscriptionPrice,
      updatedSubscriptionPrice,
      usedDays,
    );
  }

  // 추가 결제 비용 계산
  private calculateAdditionalPayment(
    beforePlanPrice: number,
    afterPlanPrice: number,
    usedDays: number,
  ): number {
    const DAYS_IN_MONTH = 30;

    if (
      beforePlanPrice < 0 ||
      afterPlanPrice < 0 ||
      usedDays < 0 ||
      usedDays > DAYS_IN_MONTH
    )
      throw new NotAcceptableException('잘못된 요청입니다.');

    const dailyPrice = beforePlanPrice / DAYS_IN_MONTH;
    const usedPrice = dailyPrice * usedDays;
    const beforeRemainPrice = beforePlanPrice - usedPrice;

    const afterDailyPrice = afterPlanPrice / DAYS_IN_MONTH;
    const newPlanPrice = afterDailyPrice * (DAYS_IN_MONTH - usedDays);

    return Math.round(newPlanPrice - beforeRemainPrice);
  }

  // 추가 결제 요청
  private async requestAdditionalPayment(
    workspace: Workspace,
    billing: WorkspaceBilling,
    amount: number,
    orderName: string,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const { id: workspaceId, name: workspaceName } = workspace;
    const { id: billingId, billingKey } = billing;
    const purchase = await transaction.purchaseHistory.create({
      data: {
        workspaceId,
        billingId,
        amount,
        reason: orderName,
        type: PurchaseType.CHANGE_SUBSCRIPTION,
        status: PurchaseStatus.READY,
      },
    });

    const { id: paymentKey } = purchase;
    const purchasedAt = await this.portoneService.requestPayment(
      paymentKey,
      billingKey,
      {
        amount,
        orderName,
        ordererId: workspaceId.toString(),
        ordererName: workspaceName,
      },
    );

    return await transaction.purchaseHistory.update({
      where: { id: paymentKey },
      data: {
        purchasedAt,
        status: PurchaseStatus.PAID,
      },
    });
  }

  // 기본 결제 정보 조회
  private async findDefaultBilling(
    workspaceId: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.workspaceBilling.findUnique({
      where: { workspaceId },
    });
  }

  // 현재 결제 목록 빌링 변경
  private async changeBilling(
    workspaceId: number,
    billingId: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const currentSchedules = await transaction.purchaseHistory.findMany({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.READY,
        scheduledId: { not: null },
        endedAt: { gte: new Date() },
        startedAt: { gte: new Date() },
      },
    });

    const currentScheduleIds = currentSchedules.map(
      (schedule) => schedule.scheduledId,
    );

    await this.portoneService.cancelScheduledPayment({
      scheduleIds: currentScheduleIds,
    });

    await transaction.purchaseHistory.updateMany({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.READY,
        scheduledId: { not: null },
        endedAt: { gte: new Date() },
        startedAt: { gte: new Date() },
      },
      data: {
        billingId,
      },
    });

    const updatedSchedules = await transaction.purchaseHistory.findMany({
      where: {
        workspaceId,
        type: PurchaseType.SUBSCRIPTION,
        status: PurchaseStatus.READY,
        scheduledId: { not: null },
        endedAt: { gte: new Date() },
        startedAt: { gte: new Date() },
      },
      include: {
        billing: true,
        workspace: true,
      },
    });

    return await Promise.allSettled(
      updatedSchedules.map(async (schedule) => {
        const {
          id: paymentKey,
          workspace: { name: workspaceName },
          billing: { billingKey },
          amount: paymentAmount,
          reason: paymentReason,
          startedAt,
        } = schedule;

        const scheduledId = await this.portoneService.requestScheduledPayment(
          paymentKey,
          billingKey,
          startedAt,
          {
            amount: paymentAmount,
            orderName: paymentReason,
            ordererId: workspaceId.toString(),
            ordererName: workspaceName,
          },
        );

        return await transaction.purchaseHistory.update({
          where: { id: paymentKey },
          data: {
            scheduledId,
          },
        });
      }),
    );
  }

  // 컨텐츠 읽기 전용 처리
  private async updateContentReadonly(
    workspaceId: number,
    contentAvailable: boolean,
    availableContentCount: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    // availableContentCount 갯수를 제외한 나머지  readonly 처리
    const contentGroups = await transaction.contentGroup.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (!contentAvailable) {
      return await transaction.contentGroup.updateMany({
        where: { workspaceId, deletedAt: null },
        data: { readonly: true },
      });
    }

    if (availableContentCount === 0) {
      return await transaction.contentGroup.updateMany({
        where: { workspaceId, deletedAt: null },
        data: { readonly: false },
      });
    }

    const readonlyContentGroups = contentGroups.slice(availableContentCount);
    return await transaction.contentGroup.updateMany({
      where: {
        id: {
          in: readonlyContentGroups.map((contentGroup) => contentGroup.id),
        },
      },
      data: { readonly: true },
    });
  }

  private async updateMessageReadonly(
    workspaceId: number,
    isMessageEnabled: boolean,
    availableMessageCount: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const messages = await transaction.messageTemplate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    if (!isMessageEnabled) {
      return await transaction.messageTemplate.updateMany({
        where: { workspaceId },
        data: { readonly: true },
      });
    }

    if (availableMessageCount === 0) {
      return await transaction.messageTemplate.updateMany({
        where: { workspaceId },
        data: { readonly: false },
      });
    }

    if (availableMessageCount >= messages.length) return;

    const readonlyMessages = messages.slice(availableMessageCount);
    return await transaction.messageTemplate.updateMany({
      where: {
        id: { in: readonlyMessages.map((message) => message.id) },
      },
      data: { readonly: true },
    });
  }

  private async updateStoreLimit(
    workspaceId: number,
    availableStoreCount: number,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const stores = await transaction.store.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (availableStoreCount === 0) {
      return await transaction.store.updateMany({
        where: { workspaceId, deletedAt: null },
        data: { readonly: false },
      });
    }

    if (availableStoreCount >= stores.length) return;

    const readonlyStores = stores.slice(availableStoreCount);
    return await transaction.store.updateMany({
      where: {
        id: { in: readonlyStores.map((store) => store.id) },
      },
      data: { readonly: true },
    });
  }

  // 구독 갱신
  private async renewSubscription(paymentId: string) {
    return await this.prismaService.$transaction(async (transaction) => {
      const purchase = await transaction.purchaseHistory.findUnique({
        where: { id: paymentId },
        include: {
          workspace: true,
          subscription: true,
          billing: true,
        },
      });
      if (!purchase)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      await transaction.purchaseHistory.update({
        where: { id: paymentId },
        data: {
          status: PurchaseStatus.PAID,
          purchasedAt: new Date(),
        },
      });

      const { workspace, subscription, billing } = purchase;
      const startAt = new Date(purchase.endedAt);
      startAt.setDate(startAt.getDate() - 1);
      startAt.setHours(13, 0, 0, 0);

      const nextSubscription = await this.createNextSubscription(
        workspace,
        subscription,
        billing,
        startAt,
        transaction,
      );

      await this.updateWorkspaceSubscription(
        workspace.id,
        nextSubscription.subscriptionId,
        nextSubscription.endedAt,
        transaction,
      );

      return nextSubscription;
    });
  }

  // 구독 실패
  private async failSubscription(paymentId: string, paymentResult: any) {
    const { customData } = paymentResult;

    return await this.prismaService.$transaction(async (transaction) => {
      const purchase = await transaction.purchaseHistory.findUnique({
        where: { id: paymentId },
        include: {
          workspace: true,
          subscription: true,
          billing: true,
        },
      });
      if (!purchase)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      const { workspace, subscription, billing } = purchase;

      await transaction.purchaseHistory.update({
        where: { id: paymentId },
        data: { status: PurchaseStatus.FAILED },
      });

      try {
        const { retry } = JSON.parse(customData);
        if (retry > this.MAX_RETRY_COUNT) return;

        const retryDate = new Date(purchase.startedAt);
        retryDate.setHours(retryDate.getHours() + this.RETRY_HOUR);

        const nextSubscription = await this.createNextSubscription(
          workspace,
          subscription,
          billing,
          retryDate,
          transaction,
          retry + 1,
        );

        return nextSubscription;
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException('결제 실패');
      }
    });
  }

  // 구독 조회
  public async getSubscription(workspaceId: number) {
    const currentSubscription = await this.currentSubscription(workspaceId);
    const nextSubscription = await this.nextSubscription(workspaceId);

    return {
      currentSubscription,
      nextSubscription,
    };
  }

  // 구독 생성
  public async createSubscription(workspaceId: number, subscriptionId: number) {
    return await this.prismaService.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.findUnique({
        where: { id: workspaceId, deletedAt: null },
      });
      if (!workspace)
        throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

      const subscription = await transaction.subscriptionModel.findUnique({
        where: { id: subscriptionId },
      });
      if (!subscription)
        throw new NotFoundException('구독을 찾을 수 없습니다.');

      const billing = await transaction.workspaceBilling.findFirst({
        where: { workspaceId },
      });
      if (!billing)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      const currentSubscription = await this.currentSubscription(workspaceId);

      if (currentSubscription)
        throw new NotAcceptableException('이미 구독이 진행 중입니다.');

      const isNotAvailableFreeTrial =
        await this.isNotAvailableFreeTrial(workspaceId);
      const currentDate = new Date();

      if (!isNotAvailableFreeTrial) {
        await this.createFreeTrial(
          workspaceId,
          subscription,
          currentDate,
          transaction,
        );
      }

      return this.createSubscriptionAfterFreeTrial(
        workspace,
        subscription,
        billing,
        currentDate,
        transaction,
      );
    });
  }

  // 구독 플랜 변경
  public async updateSubscription(workspaceId: number, subscriptionId: number) {
    return await this.prismaService.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.findUnique({
        where: { id: workspaceId, deletedAt: null },
      });
      if (!workspace)
        throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

      const subscription = await transaction.subscriptionModel.findUnique({
        where: { id: subscriptionId },
      });
      if (!subscription)
        throw new NotFoundException('구독을 찾을 수 없습니다.');

      const billing = await transaction.workspaceBilling.findFirst({
        where: { workspaceId },
      });
      if (!billing)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      const currentSubscription = await this.currentSubscription(workspaceId);
      if (!currentSubscription)
        throw new NotAcceptableException('진행 중인 구독이 없습니다.');

      const nextSubscription = await transaction.purchaseHistory.findFirst({
        where: {
          workspaceId,
          type: PurchaseType.SUBSCRIPTION,
          status: PurchaseStatus.READY,
          scheduledId: { not: null },
          endedAt: { gte: new Date() },
          startedAt: { gte: new Date() },
        },
      });

      if (
        currentSubscription.subscriptionId === subscriptionId &&
        nextSubscription &&
        nextSubscription.subscriptionId === subscriptionId
      )
        throw new NotAcceptableException('이미 해당 구독으로 진행 중입니다.');

      const currentDate = new Date();
      const { price: beforePlanPrice } = currentSubscription.subscription;
      const { price: afterPlanPrice } = subscription;
      const usedDays = Math.floor(
        (currentDate.getTime() - currentSubscription.startedAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const additionalPayment = this.calculateAdditionalPayment(
        beforePlanPrice,
        afterPlanPrice,
        usedDays,
      );

      const currentPlanIsTrial = currentSubscription.amount === 0;
      const isAdditionalPaymentNeeded =
        beforePlanPrice < afterPlanPrice && additionalPayment > 0;
      if (isAdditionalPaymentNeeded && !currentPlanIsTrial) {
        const additionalPaymentHistory = await this.requestAdditionalPayment(
          workspace,
          billing,
          additionalPayment,
          '스르륵 ' + subscription.name + ' 구독 변경 추가 결제',
          transaction,
        );

        const { purchasedAt: additionalPaymentPurchasedAt } =
          additionalPaymentHistory;

        await transaction.purchaseHistory.update({
          where: { id: currentSubscription.id },
          data: {
            subscriptionId,
            purchasedAt: additionalPaymentPurchasedAt,
          },
        });
      }

      if (isAdditionalPaymentNeeded && currentPlanIsTrial) {
        await transaction.purchaseHistory.update({
          where: { id: currentSubscription.id },
          data: {
            subscriptionId,
          },
        });
      }

      if (nextSubscription) {
        const { scheduledId } = nextSubscription;
        await this.portoneService.cancelScheduledPayment({
          scheduleIds: [scheduledId],
        });

        await transaction.purchaseHistory.update({
          where: { id: nextSubscription.id },
          data: {
            status: PurchaseStatus.CANCELLED,
            purchasedAt: new Date(),
          },
        });
      }

      const nextSubscriptionStartAt = new Date(currentSubscription.endedAt);
      nextSubscriptionStartAt.setDate(nextSubscriptionStartAt.getDate() - 1);
      nextSubscriptionStartAt.setHours(13, 0, 0, 0);

      await this.createNextSubscription(
        workspace,
        subscription,
        billing,
        nextSubscriptionStartAt,
        transaction,
      );

      const updatedSubscription = await transaction.purchaseHistory.findFirst({
        where: {
          workspaceId,
          type: PurchaseType.SUBSCRIPTION,
          status: PurchaseStatus.PAID,
          endedAt: { gte: new Date() },
        },
        orderBy: { endedAt: 'desc' },
        include: { subscription: true },
      });

      await this.updateWorkspaceLimits(
        workspaceId,
        updatedSubscription.subscription,
        updatedSubscription.endedAt,
        transaction,
      );

      return updatedSubscription;
    });
  }

  // 구독 취소
  public async cancelSubscription(workspaceId: number) {
    return await this.prismaService.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.findUnique({
        where: { id: workspaceId, deletedAt: null },
      });
      if (!workspace)
        throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

      const currentSubscription = await this.currentSubscription(workspaceId);
      if (!currentSubscription)
        throw new NotAcceptableException('진행 중인 구독이 없습니다.');

      const nextSubscription = await transaction.purchaseHistory.findFirst({
        where: {
          workspaceId,
          type: PurchaseType.SUBSCRIPTION,
          status: PurchaseStatus.READY,
          scheduledId: { not: null },
          endedAt: { gte: new Date() },
          startedAt: { gte: new Date() },
        },
        orderBy: { endedAt: 'desc' },
      });
      if (!nextSubscription)
        throw new NotAcceptableException('이미 취소된 구독입니다.');

      const { scheduledId } = nextSubscription;
      await this.portoneService.cancelScheduledPayment({
        scheduleIds: [scheduledId],
      });

      return await transaction.purchaseHistory.update({
        where: { id: nextSubscription.id },
        data: {
          status: PurchaseStatus.CANCELLED,
          purchasedAt: new Date(),
        },
      });
    });
  }

  // 결제 정보 조회
  public findBilling(workspaceId: number) {
    return this.prismaService.workspaceBilling.findUnique({
      where: { workspaceId },
    });
  }

  // 결제 정보 개수 조회
  public async countBilling(workspaceId: number) {
    return this.prismaService.workspaceBilling.count({
      where: { workspaceId },
    });
  }

  // 결제 정보 생성
  public async upsertBilling(workspaceId: number, dto: CreateBillingBodyDto) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId, deletedAt: null },
    });
    if (!workspace)
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');

    const cardExists = await this.prismaService.workspaceBilling.findUnique({
      where: {
        workspaceId,
      },
    });
    if (cardExists) throw new NotAcceptableException('이미 등록된 카드입니다.');

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

    return await this.prismaService.$transaction(async (transaction) => {
      const billing = await transaction.workspaceBilling.upsert({
        where: { workspaceId },
        update: {
          workspaceId,
          billingKey: billingKeyResponse,
          cardNumber: maskedCardNumber,
        },
        create: {
          workspaceId,
          billingKey: billingKeyResponse,
          cardNumber: maskedCardNumber,
        },
      });
      await this.changeBilling(workspaceId, billing.id, transaction);

      return billing;
    });
  }

  // 결제 정보 삭제
  public async deleteBilling(workspaceId: number, billingId: number) {
    return await this.prismaService.$transaction(async (transaction) => {
      const billing = await transaction.workspaceBilling.findUnique({
        where: { id: billingId, workspaceId },
      });
      if (!billing)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      if (billing)
        throw new NotAcceptableException(
          '기본 결제 정보는 삭제할 수 없습니다.',
        );

      const billingCount = await transaction.workspaceBilling.count({
        where: { workspaceId },
      });
      if (billingCount === 1)
        throw new NotAcceptableException(
          '최소 한 개의 결제 정보는 유지해야 합니다.',
        );

      const deletedBilling = await transaction.workspaceBilling.delete({
        where: { id: billingId },
      });
      const defaultBilling = await this.findDefaultBilling(
        workspaceId,
        transaction,
      );

      await this.changeBilling(workspaceId, defaultBilling.id, transaction);

      await this.portoneService.deleteBillingKey(billing.billingKey);

      return deletedBilling;
    });
  }

  // 기본 결제 정보 수정
  public async updateDefaultBilling(workspaceId: number, billingId: number) {
    return await this.prismaService.$transaction(async (transaction) => {
      const billing = await transaction.workspaceBilling.findUnique({
        where: { id: billingId, workspaceId },
      });
      if (!billing)
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

      const currentDefaultBilling = await this.findDefaultBilling(
        workspaceId,
        transaction,
      );
      if (currentDefaultBilling.id === billingId)
        throw new NotAcceptableException('이미 기본 결제 정보입니다.');

      await transaction.workspaceBilling.updateMany({
        where: { workspaceId },
        data: {},
      });

      const updatedBilling = await transaction.workspaceBilling.update({
        where: { id: billingId, workspaceId },
        data: {},
      });

      await this.changeBilling(workspaceId, updatedBilling.id, transaction);

      return updatedBilling;
    });
  }

  // 결제 정보 삭제
  private async handleWebhookBillingKeyDeleted(billingKey: string) {
    const billing = await this.prismaService.workspaceBilling.findUnique({
      where: { billingKey },
    });
    if (!billing) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    try {
      await this.portoneService.deleteBillingKey(billingKey);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '결제 정보를 삭제하는 중 오류가 발생했습니다.',
      );
    }
  }

  // 결제 완료
  private async handleWebhookPaymentCompleted(paymentId: string) {
    const paymentResult = await this.portoneService.getPayment(paymentId);
    if (!paymentResult)
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    const purchase = await this.prismaService.purchaseHistory.findUnique({
      where: { id: paymentId },
    });
    if (!purchase) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    // if (purchase.type === PurchaseType.CREDIT)
    // return this.completeCreditPurchase(paymentId);
  }

  // 결제 실패
  private async handleWebhookPaymentFailed(paymentId: string) {
    const paymentResult = await this.portoneService.getPayment(paymentId);
    if (!paymentResult)
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    const purchase = await this.prismaService.purchaseHistory.findUnique({
      where: { id: paymentId },
    });
    if (!purchase) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    if (purchase.type === PurchaseType.SUBSCRIPTION)
      return this.failSubscription(paymentId, paymentResult);

    return await this.prismaService.purchaseHistory.update({
      where: { id: paymentId },
      data: { status: paymentResult.status },
    });
  }

  public countPurchaseHistory(
    workspaceId: number,
    query: PurchaseHistoryQueryDto,
  ) {
    const { type } = query;

    return this.prismaService.purchaseHistory.count({
      where: {
        workspaceId,
        type,
        status: { notIn: [PurchaseStatus.READY, PurchaseStatus.PAY_PENDING] },
      },
    });
  }

  public getPurchaseHistory(
    workspaceId: number,
    query: PurchaseHistoryQueryDto,
  ) {
    const { type, skip, take } = query;

    return this.prismaService.purchaseHistory.findMany({
      where: {
        workspaceId,
        type,
        status: { notIn: [PurchaseStatus.READY, PurchaseStatus.PAY_PENDING] },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 웹훅 처리
  public async webhook(dto: WebhookBodyDto) {
    const {
      type,
      data: { billingKey, paymentId },
    } = dto;

    try {
      switch (type) {
        case WebhookTypeEnum.BillingKeyDeleted:
          return this.handleWebhookBillingKeyDeleted(billingKey);
        case WebhookTypeEnum.TransactionPaid:
          return this.handleWebhookPaymentCompleted(paymentId);
        case WebhookTypeEnum.TransactionFailed:
          return this.handleWebhookPaymentFailed(paymentId);
        default:
          return true;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
