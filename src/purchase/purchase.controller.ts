import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseBodyDto } from './dto/req/create-purchase-body.dto';

import { Serialize } from 'src/common/decorators/serialize.decorator';
import { BillingDto } from './dto/res/billing.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { BillingQueryDto } from './dto/req/billing-query.dto';
import { CreateCreditPurchaseOrderBodyDto } from './dto/req/create-credit-purchase-order-body.dto';
import { CompletePurchaseBodyDto } from './dto/req/completed-purchase-body.dto';

@ApiTags('Purchase')
@WorkspaceController('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('billing')
  @ApiOperation({
    summary: '빌링키 목록 조회',
    description: '워크스페이스의 빌링키 목록을 조회합니다.',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  @Serialize(BillingDto, true)
  @ApiOkResponsePaginated(BillingDto)
  public async billingList(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() query: BillingQueryDto,
  ) {
    const nodes = await this.purchaseService.findBilling(workspaceId, query);
    const total = await this.purchaseService.countBilling(workspaceId);

    return { nodes, total };
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
    return this.purchaseService.createBilling(workspaceId, dto);
  }

  @Delete('billing/:billingId')
  @ApiOperation({
    summary: '빌링키 삭제',
    description: '워크스페이스의 빌링키를 삭제합니다.',
  })
  @Serialize(BillingDto)
  @ApiResponse({
    status: 200,
    type: BillingDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async deleteBilling(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('billingId') billingId: number,
  ) {
    return this.purchaseService.deleteBilling(workspaceId, billingId);
  }

  @Post('billing/:billingId/default')
  @ApiOperation({
    summary: '빌링키 기본 설정',
    description: '워크스페이스의 빌링키를 기본으로 설정합니다.',
  })
  @Post('order')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async order(
    @Param('billingId') billingId: number,
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.purchaseService.updateDefaultBilling(workspaceId, billingId);
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

  @Get()
  @ApiOperation({
    summary: '구독 정보 조회',
    description: '워크스페이스의 구독 정보를 조회합니다.',
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
  public async deleteSubscription(
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.purchaseService.cancelSubscription(workspaceId);
  }
}
