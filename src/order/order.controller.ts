import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { OrderDto } from './dto/res/order.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { FindOrderQueryDto } from './dto/req/find-order-query.dto';
import { CreateOrderBodyDto } from './dto/req/create-order-body.dto';
import { UpdateOrderBodyDto } from './dto/req/update-order-body';
import { OrderHistoryDto } from './dto/res/order-history.dto';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

@ApiTags('order')
@WorkspaceController('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: '주문 조회',
    description: '주문을 조회하고 검색합니다.',
  })
  @Get()
  @Serialize(OrderDto, true)
  @ApiOkResponsePaginated(OrderDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async findMany(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() dto: FindOrderQueryDto,
  ) {
    const nodes = await this.orderService.findMany(workspaceId, dto);
    const total = await this.orderService.count(workspaceId, dto);

    return {
      nodes,
      total,
    };
  }

  @ApiOperation({
    summary: '주문 상세 조회',
    description: '주문을 상세 조회합니다.',
  })
  @Get(':orderId')
  @ApiResponse({
    status: 200,
    description: '주문 조회 성공',
    type: OrderDto,
  })
  @Serialize(OrderDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async findOne(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('orderId') orderId: number,
  ) {
    return this.orderService.findOne(workspaceId, orderId);
  }

  @ApiOperation({
    summary: '주문 생성',
    description: '주문을 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 생성 성공',
    type: OrderDto,
  })
  @Post()
  @Serialize(OrderDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async create(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() dto: CreateOrderBodyDto,
  ) {
    return this.orderService.create(workspaceId, dto);
  }

  @ApiOperation({
    summary: '주문 수정',
    description: '주문을 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 수정 성공',
    type: OrderDto,
  })
  @Patch(':orderId')
  @Serialize(OrderDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async update(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query('orderId') orderId: number,
    @Body() dto: UpdateOrderBodyDto,
  ) {
    return this.orderService.update(workspaceId, orderId, dto);
  }

  @ApiOperation({
    summary: '주문 삭제',
    description: '주문을 삭제합니다.',
  })
  @Delete(':orderId')
  @ApiResponse({
    status: 200,
    description: '주문 삭제 성공',
    type: OrderDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async delete(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query('orderId') orderId: number,
  ) {
    return this.orderService.delete(workspaceId, orderId);
  }

  @ApiOperation({
    summary: '주문 기록 조회',
    description: '주문을 기록을 조회합니다.',
  })
  @Get(':orderId/history')
  @Serialize(OrderHistoryDto, true)
  @ApiOkResponsePaginated(OrderHistoryDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async findHistory(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('orderId') orderId: number,
    @Query() dto: PaginationQueryDto,
  ) {
    const nodes = await this.orderService.findHistory(
      workspaceId,
      orderId,
      dto,
    );
    const total = await this.orderService.countHistory(workspaceId, orderId);

    return {
      nodes,
      total,
    };
  }
}
