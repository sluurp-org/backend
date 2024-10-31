import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PortoneService } from 'src/portone/portone.service';
import { PurchaseStatus } from '@prisma/client';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';

@Injectable()
export class PurchaseService {
  private readonly MAX_RETRY_COUNT = 3; // 재결제 최대 시도 횟수
  private readonly RETRY_INTERVAL_DAYS = 1; // 재결제 시도 간격 (1일)
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly portoneService: PortoneService,
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

  public async portoneWebhook(body: WebhookBodyDto) {}
}
