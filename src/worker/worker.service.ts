import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import {
  EventStatus,
  KakaoTemplateStatus,
  Order,
  Prisma,
  Store,
  StoreType,
} from '@prisma/client';
import { FindTokenQueryDto } from 'src/smartstore/dto/find-token-query.dto';
import { SmartstoreService } from 'src/smartstore/smartstore.service';
import { FindOrderBatchQueryDto } from 'src/order/dto/req/find-order-batch-query.dto';
import { FindOrdersBatchBodyDto } from 'src/order/dto/req/find-orders-batch-body.dto';
import { UpsertOrdersBatchBodyDto } from 'src/order/dto/req/upsert-orders-batch-body.dto';
import { FindOrdersBatchResponseDto } from 'src/order/dto/res/find-orders-batch-response.dto';
import { OrderService } from 'src/order/order.service';
import { StoreService } from 'src/store/store.service';
import { KakaoTemplateStatusBodyDto } from './dto/req/kakao-template-status-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolapiMessageStatuBodyDto } from './dto/req/solapi-message-status-body.dto';
import { CreditService } from 'src/credit/credit.service';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly smartstoreService: SmartstoreService,
    private readonly storeService: StoreService,
    private readonly prismaService: PrismaService,
    private readonly creditService: CreditService,
  ) {}

  public async findOrdersByBatchQuery(
    dto: FindOrderBatchQueryDto,
  ): Promise<Order[]> {
    return await this.orderService.findManyByBatchQuery(dto);
  }

  public async findOrdersByBatchBody(
    batchDto: FindOrdersBatchBodyDto,
  ): Promise<FindOrdersBatchResponseDto[]> {
    return await this.orderService.findManyByBatchBody(batchDto);
  }

  public async upsertOrders(batchDto: UpsertOrdersBatchBodyDto) {
    const events = await this.orderService.updateBatchOrders(batchDto);
    return events;
  }

  public async findSmartstoreToken(dto: FindTokenQueryDto): Promise<string> {
    const { applicationId, applicationSecret } = dto;

    return await this.smartstoreService.findAccessToken(
      applicationId,
      applicationSecret,
    );
  }

  public async expiredSmartstoreToken(applicationId: string) {
    await this.prismaService.store.updateMany({
      where: { smartStoreCredentials: { applicationId } },
      data: {
        enabled: false,
      },
    });
  }

  public async updateStoreLastSyncedAt(
    storeId: number,
    lastSyncedAt: Date,
  ): Promise<Store> {
    return this.storeService.updateStoreLastSyncedAt(storeId, lastSyncedAt);
  }

  public async handleSolapiKakaoTemplateStatusWebhook(
    dto: KakaoTemplateStatusBodyDto,
  ) {
    const { id, status } = this.extractTemplateStatus(dto.title);
    if (!id) throw new NotAcceptableException('템플릿 ID를 찾을 수 없습니다.');

    const template = await this.prismaService.kakaoTemplate.findUnique({
      where: { id },
    });
    if (!template)
      throw new NotAcceptableException('템플릿을 찾을 수 없습니다.');

    return await this.prismaService.kakaoTemplate.update({
      where: { id },
      data: { status },
    });
  }

  private extractTemplateStatus(message: string) {
    try {
      const idRegex = /kakao-template-(\d+)/;
      const idMatch = message.match(idRegex);
      const id = idMatch ? parseInt(idMatch[1], 10) : null;

      const statusRegex = /(승인|반려|알림)/;
      const statusMatch = message.split('검수')[1].match(statusRegex);
      const parsedStatus = statusMatch ? statusMatch[1] : null;

      let status: KakaoTemplateStatus = KakaoTemplateStatus.PENDING;
      if (parsedStatus === '승인') status = KakaoTemplateStatus.APPROVED;
      if (parsedStatus === '반려') status = KakaoTemplateStatus.REJECTED;

      return { id, status };
    } catch (error) {
      throw new NotAcceptableException(
        '템플릿 정보를 추출하는데 실패했습니다.',
      );
    }
  }

  public async handleSolapiMessageWebhook(dto: SolapiMessageStatuBodyDto[]) {
    const events = await Promise.allSettled(
      dto.map(async (payload) => {
        return await this.prismaService.$transaction(async (tx) => {
          const {
            customFields: { eventId },
            dateProcessed,
            messageId,
            statusCode,
          } = payload;

          const event = await tx.eventHistory.findUnique({
            where: { id: eventId },
            include: {
              order: {
                include: {
                  store: {
                    include: {
                      smartStoreCredentials: true,
                    },
                  },
                },
              },
              credit: true,
              event: {
                include: {
                  message: true,
                },
              },
            },
          });
          if (!event)
            throw new NotAcceptableException('이벤트를 찾을 수 없습니다.');

          if (statusCode === '4000') {
            const updatedEventHistory = await tx.eventHistory.update({
              where: { id: eventId },
              data: {
                status: EventStatus.SUCCESS,
                processedAt: dateProcessed,
                solapiMessageId: messageId,
                solapiStatusCode: statusCode,
                message: '메세지 발송 성공',
              },
            });

            return {
              event,
              success: true,
              isUpdateDelivery: event.event.message.completeDelivery,
              updatedEventHistory,
            };
          }

          if (event.credit) {
            await this.creditService.create(
              event.order.workspaceId,
              {
                amount: event.credit.amount,
                reason: '메세지 미발송건 환불',
              },
              tx,
            );
          }

          if (event.contentId) {
            await tx.content.update({
              where: { id: event.contentId },
              data: { used: false },
            });
          }

          const updatedEventHistory = await tx.eventHistory.update({
            where: { id: eventId },
            data: {
              status: EventStatus.FAILED,
              processedAt: dateProcessed,
              solapiMessageId: messageId,
              solapiStatusCode: statusCode,
              message: '메세지 발송 실패',
            },
          });

          return {
            event,
            success: false,
            isUpdateDelivery: event.event.message.completeDelivery,
            updatedEventHistory,
          };
        });
      }),
    );

    const completedEvents = events
      .filter((event) => event.status === 'fulfilled')
      .filter((event) => event.value.success)
      .filter((event) => event.value.isUpdateDelivery)
      .map((event) => event.value.event);

    await this.completeDelivery(completedEvents);
  }

  private async completeDelivery(
    events: Prisma.EventHistoryGetPayload<{
      include: {
        order: {
          include: { store: { include: { smartStoreCredentials: true } } };
        };
      };
    }>[],
  ) {
    // group by store id, and return productOrderId, type, dateProcessed
    const eventHistoryGroupByStore = events.reduce<
      Record<
        number,
        {
          type: StoreType;
          applicationId: string;
          applicationSecret: string;
          events: Prisma.EventHistoryGetPayload<{
            include: { order: true };
          }>[];
        }
      >
    >((acc, event) => {
      const storeId = event.order.store.id;
      if (!acc[storeId]) {
        acc[storeId] = {
          type: event.order.store.type,
          applicationId: event.order.store.smartStoreCredentials.applicationId,
          applicationSecret:
            event.order.store.smartStoreCredentials.applicationSecret,
          events: [],
        };
      }

      acc[storeId].events.push(event);
      return acc;
    }, {});

    const results = await Promise.allSettled(
      Object.values(eventHistoryGroupByStore).map(
        async ({ type, applicationId, applicationSecret, events }) => {
          if (type !== StoreType.SMARTSTORE)
            throw new NotAcceptableException(
              '배송 처리는 스마트스토어에서만 가능합니다.',
            );

          return await this.smartstoreService.completeDelivery(
            applicationId,
            applicationSecret,
            events.map((event) => event.order.productOrderId),
          );
        },
      ),
    );

    const failedEvents = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason);

    this.logger.error(failedEvents);
  }

  public async sendStoreCronJob() {
    return this.storeService.sendStoreToSqs();
  }
}
