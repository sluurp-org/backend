import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseBodyDto } from './dto/req/create-purchase-body.dto';

import { Serialize } from 'src/common/decorators/serialize.decorator';
import { BillingDto } from './dto/res/billing.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { CreateCreditPurchaseOrderBodyDto } from './dto/req/create-credit-purchase-order-body.dto';
import { CompletePurchaseBodyDto } from './dto/req/completed-purchase-body.dto';
import { SubscriptionResponseDto, WorkspaceSubscriptionResponseDto } from './dto/res/subscription.dto';
import { PurchaseHistoryDto } from './dto/res/purchase-history';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';

@ApiTags('Purchase')
@WorkspaceController('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('billing')
  @ApiOperation({
    summary: '빌링키 조회',
    description: '워크스페이스의 빌링키를 조회합니다.',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  @Serialize(BillingDto)
  @ApiOkResponse({
    type: BillingDto,
  })
  public async getBilling(
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.purchaseService.findBilling(workspaceId);
  }

  @Post('billing')
  @ApiOperation({
    summary: '빌링키 생성',
    description: '워크스페이스의 빌링키를 생성합니다.',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  @Serialize(BillingDto)
  @ApiResponse({
    status: 200,
    type: BillingDto,
  })
  public async billing(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() dto: CreateBillingBodyDto,
  ) {
    return this.purchaseService.upsertBilling(workspaceId, dto);
  }

  @Post('order/credit')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async orderCredit(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() dto: CreateCreditPurchaseOrderBodyDto,
  ) {
    return this.purchaseService.createCreditPurchaseOrder(workspaceId, dto);
  }

  @Post('order/completed')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async orderCompleted(@Body() { paymentId }: CompletePurchaseBodyDto) {
    return this.purchaseService.completeCreditPurchase(paymentId);
  }

  @Get('history')
  @ApiOperation({
    summary: '결제 이력 조회',
    description: '워크스페이스의 결제 이력을 조회합니다.',
  })
  @Serialize(PurchaseHistoryDto, true)
  @ApiOkResponsePaginated(PurchaseHistoryDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async history(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() query: PurchaseHistoryQueryDto,
  ) {
    const total = await this.purchaseService.countPurchaseHistory(workspaceId, query);
    const nodes = await this.purchaseService.getPurchaseHistory(workspaceId, query);

    return { nodes, total };
  }

  @Get()
  @ApiOperation({
    summary: '구독 정보 조회',
    description: '워크스페이스의 구독 정보를 조회합니다.',
  })
  @Serialize(WorkspaceSubscriptionResponseDto)
  @ApiOkResponse({
    type: WorkspaceSubscriptionResponseDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async subscription(@ReqWorkspace() { id: workspaceId }: Workspace) {
    return this.purchaseService.getSubscription(workspaceId);
  }

  @Post()
  @ApiOperation({
    summary: '구독 정보 생성',
    description: '워크스페이스의 구독 정보를 생성합니다.',
  })
  @Serialize(SubscriptionResponseDto)
  @ApiResponse({
    status: 200,
    type: SubscriptionResponseDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async createSubscription(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() { subscriptionId }: CreatePurchaseBodyDto,
  ) {
    return this.purchaseService.createSubscription(workspaceId, subscriptionId);
  }

  @Patch()
  @ApiOperation({
    summary: '구독 정보 수정',
    description: '워크스페이스의 구독 정보를 수정합니다.',
  })
  @Serialize(SubscriptionResponseDto)
  @ApiResponse({
    status: 200,
    type: SubscriptionResponseDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async updateSubscription(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() { subscriptionId }: CreatePurchaseBodyDto,
  ) {
    return this.purchaseService.updateSubscription(workspaceId, subscriptionId);
  }

  @Delete()
  @ApiOperation({
    summary: '구독 정보 삭제',
    description: '워크스페이스의 구독 정보를 삭제합니다.',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  @Serialize(SubscriptionResponseDto)
  @ApiResponse({
    status: 200,
    type: SubscriptionResponseDto,
  })
  public async deleteSubscription(
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.purchaseService.cancelSubscription(workspaceId);
  }
}
