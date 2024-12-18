import {
  UseGuards,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkerAuth } from 'src/auth/decorators/worker-auth.decorator';
import { WorkerService } from './worker.service';
import { FindTokenQueryDto } from 'src/smartstore/dto/find-token-query.dto';
import { UpdateLastFetchStoreDto } from 'src/store/dto/req/update-last-fetch-store.dto';
import { FindOrdersBatchBodyDto } from 'src/order/dto/req/find-orders-batch-body.dto';
import { FindOrdersBatchResponseDto } from 'src/order/dto/res/find-orders-batch-response.dto';
import { UpsertOrdersBatchBodyDto } from 'src/order/dto/req/upsert-orders-batch-body.dto';
import { UpsertOrdersBatchResponseDto } from 'src/order/dto/res/upsert-orders-batch-response.dto';
import { FindOrderBatchQueryDto } from 'src/order/dto/req/find-order-batch-query.dto';
import { OrderDto } from 'src/order/dto/res/order.dto';
import { KakaoTemplateStatusBodyDto } from './dto/req/kakao-template-status-body.dto';
import { SolapiMessageStatuBodyDto } from './dto/req/solapi-message-status-body.dto';
import { PurchaseService } from 'src/purchase/purchase.service';
import { PortoneGuard } from 'src/portone/gurad/portone.guard';
import { WebhookBodyDto } from 'src/portone/dto/req/webhook-body.dto';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { FindCookieQueryDto } from 'src/smartplace/dto/find-cookie-query.dto';

@ApiTags('worker')
@Controller('worker')
export class WorkerController {
  constructor(
    private readonly workerService: WorkerService,
    private readonly purchaseService: PurchaseService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @ApiOperation({
    summary: '주문 조회',
    description: '주문을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 조회 성공',
    type: [OrderDto],
  })
  @Get('order')
  @WorkerAuth()
  public async getOrders(@Query() dto: FindOrderBatchQueryDto) {
    return await this.workerService.findOrdersByBatchQuery(dto);
  }

  @ApiOperation({
    summary: '주문 배치 조회',
    description: '주문을 배치로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 배치 조회 성공',
    type: [FindOrdersBatchResponseDto],
  })
  @Post('order/find')
  @WorkerAuth()
  public async findOrders(@Body() batchDto: FindOrdersBatchBodyDto) {
    return await this.workerService.findOrdersByBatchBody(batchDto);
  }

  @ApiOperation({
    summary: '신규 주문 배치 업데이트',
    description: '신규 주문을 배치로 업데이트 합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '신규 주문 배치 업데이트 성공',
    type: [UpsertOrdersBatchResponseDto],
  })
  @Post('order/upsert')
  @WorkerAuth()
  public async upsertOrders(@Body() batchDto: UpsertOrdersBatchBodyDto) {
    return await this.workerService.upsertOrders(batchDto);
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
  @Get('smartstore/token')
  @WorkerAuth()
  public async findAccessToken(@Query() dto: FindTokenQueryDto) {
    return await this.workerService.findSmartstoreToken(dto);
  }

  @ApiOperation({
    summary: '네이버 플레이스 쿠키 조회',
    description: '네이버 플레이스 쿠키를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '네이버 플레이스 토큰 조회 성공',
    type: String,
  })
  @Get('smartplace/token')
  @WorkerAuth()
  public async findSmartplaceToken(@Query() dto: FindCookieQueryDto) {
    return await this.workerService.findSmartplaceToken(dto);
  }

  @ApiOperation({
    summary: '스토어 마지막 조회 시간 업데이트',
    description: '스토어의 마지막 조회 시간을 업데이트합니다.',
  })
  @Post('store/:storeId/sync')
  @WorkerAuth()
  public async updateStoreLastSyncedAt(
    @Param('storeId') storeId: number,
    @Body() { lastSyncedAt }: UpdateLastFetchStoreDto,
  ) {
    return await this.workerService.updateStoreLastSyncedAt(
      storeId,
      lastSyncedAt,
    );
  }

  @ApiOperation({
    summary: '스토어 크론 웹훅',
    description: '스토어 크론 웹훅을 처리합니다.',
  })
  @Post('store/cron')
  @WorkerAuth()
  public async sendStoreCronJob() {
    return await this.workerService.sendStoreCronJob();
  }

  @ApiOperation({
    summary: '결제 요청 웹훅',
    description: '워크스페이스 결제를 요청합니다.',
  })
  @Post('purchase/request')
  @WorkerAuth()
  public async requestPurchase() {
    return await this.purchaseService.createPurchase();
  }

  @ApiOperation({
    summary: '솔라피 카카오 템플릿 상태 변경 웹훅',
    description: '솔라피 카카오 템플릿 상태 변경 웹훅을 처리합니다.',
  })
  @Post('solapi/kakao/template')
  @WorkerAuth()
  public async handleSolapiKakaoTemplateStatusWebhook(
    @Body() dto: KakaoTemplateStatusBodyDto,
  ) {
    return await this.workerService.handleSolapiKakaoTemplateStatusWebhook(dto);
  }

  @Post('solapi/message')
  @ApiOperation({
    summary: '솔라피 메시지 발송 결과 웹훅',
    description: '솔라피 메시지 발송 결과 웹훅을 처리합니다.',
  })
  public async handleSolapiMessageWebhook(
    @Body() dto: SolapiMessageStatuBodyDto[],
  ) {
    return await this.workerService.handleSolapiMessageWebhook(dto);
  }

  @Post('portone/webhook')
  @ApiOperation({
    summary: '포트원 웹훅',
    description: '포트원 웹훅을 처리합니다.',
  })
  @UseGuards(PortoneGuard)
  public async webhook(@Body() dto: WebhookBodyDto) {
    return this.purchaseService.handlePaymentWebhook(dto);
  }
}
