import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { CreateBillingBodyDto } from './dto/req/create-billing-body.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Serialize } from 'src/common/decorators/serialize.decorator';
import { BillingDto } from './dto/res/billing.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { PurchaseHistoryDto } from './dto/res/purchase-history.dto';
import { PurchaseHistoryQueryDto } from './dto/req/purchase-history-query.dto';
import { PurchaseDto } from './dto/res/purchase.dto';

@ApiTags('Purchase')
@WorkspaceController('purchase')
export class PurchaseWorkspaceController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get()
  @ApiOperation({
    summary: '결제 정보 조회',
    description: '워크스페이스의 결제 정보를 조회합니다.',
  })
  @Serialize(PurchaseDto)
  @ApiOkResponse({
    type: PurchaseDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async getPurchase(@ReqWorkspace() { id: workspaceId }: Workspace) {
    return this.purchaseService.getPurchase(workspaceId);
  }

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
  public async getBilling(@ReqWorkspace() { id: workspaceId }: Workspace) {
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

  @Delete('billing')
  @ApiOperation({
    summary: '빌링키 삭제',
    description: '워크스페이스의 빌링키를 삭제합니다.',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  @Serialize(BillingDto)
  @ApiResponse({
    status: 200,
    type: BillingDto,
  })
  public async deleteBilling(@ReqWorkspace() { id: workspaceId }: Workspace) {
    return this.purchaseService.deleteBilling(workspaceId);
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
    const total = await this.purchaseService.countPurchaseHistory(workspaceId);
    const nodes = await this.purchaseService.findPurchaseHistory(
      workspaceId,
      query,
    );

    return { nodes, total };
  }

  @Post(':purchaseId')
  @ApiOperation({
    summary: '결제 요청',
    description: '워크스페이스의 결제를 요청합니다.',
  })
  @Serialize(PurchaseDto)
  @ApiOkResponse({
    type: PurchaseDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  public async requestPurchase(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('purchaseId') purchaseId: string,
  ) {
    return this.purchaseService.purchaseReuqest(workspaceId, purchaseId);
  }
}
