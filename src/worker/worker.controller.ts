import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkerAuth } from 'src/auth/decorators/worker-auth.decorator';
import { WorkerService } from './worker.service';
import { FindOrdersDto } from 'src/order/dto/req/find-batch.dto';
import { UpdateOrdersDto } from 'src/order/dto/req/upsert-batch.dto';
import { FindOrderBatchResponseDto } from 'src/order/dto/res/find-batch-response.dto';
import { GetTokenQueryDto } from 'src/ncommerce/dto/get-token-query.dto';
import { UpdateLastFetchStoreDto } from 'src/store/dto/update-last-fetch-store.dto';
import { FindOrderQueryDto } from 'src/order/dto/req/find-order-query.dto';

@ApiTags('worker')
@Controller('worker')
@WorkerAuth()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @ApiOperation({
    summary: '주문 조회',
    description: '주문을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 조회 성공',
    type: [FindOrderBatchResponseDto],
  })
  @Get('order')
  public async getOrders(@Query() dto: FindOrderQueryDto) {
    return await this.workerService.getOrders(dto);
  }

  @ApiOperation({
    summary: '주문 배치 조회',
    description: '주문을 배치로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 배치 조회 성공',
    type: [FindOrderBatchResponseDto],
  })
  @Post('order/find')
  public async findOrders(@Body() batchDto: FindOrdersDto) {
    return await this.workerService.findOrders(batchDto);
  }

  @ApiOperation({
    summary: '신규 주문 배치 업데이트',
    description: '신규 주문을 배치로 업데이트 합니다.',
  })
  @Post('order/update')
  public async updateOrders(@Body() batchDto: UpdateOrdersDto) {
    return await this.workerService.updateOrders(batchDto);
  }

  @ApiOperation({
    summary: '네이버 커머스 토큰 조회',
    description: '네이버 커머스 토큰을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '네이버 커머스 토큰 조회 성공',
    type: String,
  })
  @Get('ncommerce/token')
  public async getAccessToken(@Query() dto: GetTokenQueryDto) {
    return await this.workerService.getNcommerceToken(dto);
  }

  @ApiOperation({
    summary: '스토어 마지막 조회 시간 업데이트',
    description: '스토어의 마지막 조회 시간을 업데이트합니다.',
  })
  @Post('store/:storeId/sync')
  public async updateStoreLastSyncedAt(
    @Param('storeId') storeId: number,
    @Body() { lastSyncedAt }: UpdateLastFetchStoreDto,
  ) {
    return await this.workerService.updateStoreLastSyncedAt(
      storeId,
      lastSyncedAt,
    );
  }
}
