import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindEventQueryDto } from './dto/req/find-event-query.dto';
import { CreateEventBodyDto } from './dto/req/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/req/update-event-body.dto';
import { FindEventHistoryQueryDto } from './dto/req/find-event-history-query.dto';
import {
  EventStatus,
  Order,
  OrderHistoryType,
  Prisma,
  Variables,
} from '@prisma/client';
import { MessageService } from 'src/message/message.service';
import { ContentService } from 'src/content/content.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly messageService: MessageService,
    private readonly contentService: ContentService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  public async findMany(workspaceId: number, dto: FindEventQueryDto) {
    const { take, skip, id, messageId, productId, productVariantId } = dto;

    return this.prismaService.event.findMany({
      where: {
        workspaceId,
        id,
        messageId,
        productId,
        productVariantId: productVariantId ? productVariantId : null,
      },
      include: { message: true },
      take,
      skip,
      orderBy: { id: 'desc' },
    });
  }

  public async count(workspaceId: number, dto: FindEventQueryDto) {
    const { id, messageId, productId, productVariantId } = dto;

    return this.prismaService.event.count({
      where: {
        workspaceId,
        id,
        messageId,
        productId,
        productVariantId: productVariantId ? productVariantId : null,
      },
    });
  }

  public async findOne(workspaceId: number, eventId: number) {
    return this.prismaService.event.findUnique({
      where: {
        workspaceId,
        id: eventId,
      },
    });
  }

  public async findHistory(workspaceId: number, dto: FindEventHistoryQueryDto) {
    const { take, skip, eventId, messageId, productId, productVariantId } = dto;
    return this.prismaService.eventHistory.findMany({
      where: {
        eventId,
        event: {
          workspaceId,
          messageId,
          productId,
          productVariantId,
        },
      },
      include: {
        event: true,
        contents: {
          include: {
            content: true,
          },
        },
        order: {
          include: {
            product: true,
            productVariant: true,
          },
        },
      },
      take,
      skip,
    });
  }

  public async countHistory(
    workspaceId: number,
    dto: FindEventHistoryQueryDto,
  ) {
    const { eventId, messageId, productId, productVariantId } = dto;
    return this.prismaService.eventHistory.count({
      where: {
        eventId,
        event: {
          workspaceId,
          messageId,
          productId,
          productVariantId,
        },
      },
    });
  }

  public async create(workspaceId: number, dto: CreateEventBodyDto) {
    return this.prismaService.event.create({
      data: {
        workspaceId,
        ...dto,
      },
    });
  }

  public async update(
    workspaceId: number,
    eventId: number,
    dto: UpdateEventBodyDto,
  ) {
    return this.prismaService.event.update({
      where: {
        workspaceId,
        id: eventId,
      },
      data: dto,
    });
  }

  public async delete(workspaceId: number, eventId: number) {
    return this.prismaService.event.delete({
      where: {
        workspaceId,
        id: eventId,
      },
    });
  }

  private async createEventHistoryInput(
    order: Order,
    event: Prisma.EventGetPayload<{
      include: { message: { include: { contentGroup: true } } };
    }>,
    transaction: Prisma.TransactionClient = this.prismaService,
  ): Promise<
    Pick<
      Prisma.EventHistoryCreateInput,
      'event' | 'order' | 'contents' | 'status' | 'message' | 'messageTemplate'
    >
  > {
    const { id: orderId, receiverPhone, quantity } = order;
    const {
      id: eventId,
      message: { id: messageId, contentGroup },
    } = event;

    if (contentGroup) {
      try {
        const { id: contentGroupId, expireMinute, oneTime } = contentGroup;

        const contents = await this.contentService.findAvailableContent(
          contentGroupId,
          oneTime ? quantity : 1,
          transaction,
        );

        if (oneTime) {
          await this.contentService.markContentAsUsed(
            contents.map(({ id }) => id),
            transaction,
          );
        }

        const expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + expireMinute);

        return {
          messageTemplate: { connect: { id: messageId } },
          event: { connect: { id: eventId } },
          order: { connect: { id: orderId } },
          contents: {
            createMany: {
              data: contents.map(({ id, contentGroup }) => ({
                contentId: id,
                expiredAt: expireMinute ? expireAt : null,
                downloadLimit: contentGroup.downloadLimit,
              })),
            },
          },
          status: EventStatus.CONTENT_READY,
        };
      } catch (error) {
        return {
          event: { connect: { id: eventId } },
          order: { connect: { id: orderId } },
          status: EventStatus.FAILED,
          message: error.message,
        };
      }
    }

    if (!receiverPhone)
      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        message: '수신자 전화번호가 유효하지 않습니다.',
        status: EventStatus.FAILED,
      };

    try {
      return {
        messageTemplate: { connect: { id: messageId } },
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        status: EventStatus.CONTENT_READY,
      };
    } catch (error) {
      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        status: EventStatus.FAILED,
        message: error.message,
      };
    }
  }

  private async createEventHistories(
    order: Prisma.OrderGetPayload<{
      include: {
        product: true;
        productVariant: true;
        store: true;
      };
    }>,
    events: Prisma.EventGetPayload<{
      include: { message: { include: { contentGroup: true } } };
    }>[],
  ) {
    const eventHistoryInputs = await Promise.all(
      events.map((event) => this.createEventHistoryInput(order, event)),
    );

    return this.prismaService.$transaction(async (transaction) => {
      return Promise.all(
        eventHistoryInputs.map(async (eventHistoryInput) => {
          const { id: orderId, storeId, workspaceId } = order;
          const { message } = eventHistoryInput;

          const eventHistory = await transaction.eventHistory.create({
            data: {
              ...eventHistoryInput,
              workspace: { connect: { id: workspaceId } },
              orderHistory: {
                create: {
                  orderId,
                  storeId,
                  workspaceId,
                  message,
                  type: OrderHistoryType.EVENT,
                },
              },
            },
            include: {
              messageTemplate: {
                include: {
                  kakaoTemplate: true,
                },
              },
            },
          });

          return {
            eventHistory,
            order,
          };
        }),
      );
    });
  }

  private createMessageBody(
    eventHistory: Prisma.EventHistoryGetPayload<{
      include: {
        messageTemplate: {
          include: {
            kakaoTemplate: true;
          };
        };
      };
    }>,
    order: Prisma.OrderGetPayload<{
      include: {
        product: true;
        productVariant: true;
        store: true;
      };
    }>,
    variables: Variables[],
  ): Prisma.EventHistoryUpdateInput {
    const { messageTemplate, id: eventHistoryId } = eventHistory;
    const { kakaoTemplate } = messageTemplate;

    const { product, productVariant, store, orderAt, ...orderRest } = order;

    const variableBody = {
      storeName: store.name,
      eventId: eventHistoryId,
      productName: product?.name || '-',
      productVariantName: productVariant?.name || '-',
      orderAt: orderAt
        ? format(orderAt, 'yyyy-MM-dd HH:mm', {
            locale: ko,
          })
        : '-',
      ...orderRest,
    };

    const replaceTargetVariables = [
      ...messageTemplate.variables,
      { key: '#{이벤트_아이디}', value: '{이벤트아이디}' },
    ];

    const replacedVariables = replaceTargetVariables
      .map((variable) => {
        const { key, value } = variable;

        return {
          key,
          value: this.messageService.replaceVariables(
            variables,
            variableBody,
            value,
          ),
        };
      })
      .map(({ key, value }) => ({ [key]: value }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});

    return {
      messageContent: kakaoTemplate.content,
      messageVariables: replacedVariables,
    };
  }

  public async createEventHistoryBody(
    orders: {
      events: Prisma.EventGetPayload<{
        include: { message: { include: { contentGroup: true } } };
      }>[];
      order: Prisma.OrderGetPayload<{
        include: {
          store: true;
          product: true;
          productVariant: true;
        };
      }>;
    }[],
  ) {
    if (!orders.length) return;

    const eventHistories = await Promise.all(
      orders.map(async (payload) =>
        this.createEventHistories(payload.order, payload.events),
      ),
    );

    const availableEvents = eventHistories
      .flat()
      .filter(
        (event) => event.eventHistory.status === EventStatus.CONTENT_READY,
      );
    if (!availableEvents.length) return;

    const variables = await this.prismaService.variables.findMany();

    const messageBodies = await Promise.all(
      availableEvents.map(async (eventPayload) => {
        try {
          const updateInput = this.createMessageBody(
            eventPayload.eventHistory,
            eventPayload.order,
            variables,
          );

          const updatedEvent = await this.prismaService.eventHistory.update({
            where: { id: eventPayload.eventHistory.id },
            data: {
              ...updateInput,
              status: EventStatus.READY,
            },
          });

          return {
            status: 'fulfilled',
            value: updatedEvent,
            id: eventPayload.eventHistory.id,
          };
        } catch (error) {
          return {
            status: 'rejected',
            reason: error,
            id: eventPayload.eventHistory.id,
          };
        }
      }),
    );

    const successedMessage = messageBodies.filter(
      (messageBody) => messageBody.status === 'fulfilled',
    );

    this.logger.log(
      `${successedMessage.length}개의 메세지 바디를 생성하였습니다.`,
    );

    const failedMessage = messageBodies.filter(
      (messageBody) => messageBody.status === 'rejected',
    );
    const failedMessageEventHistoryIds = failedMessage.map((item) => item.id);

    if (failedMessage.length) {
      this.logger.error(
        `${failedMessage.length}개의 메세지 바디를 생성하는데 실패하였습니다.`,
      );

      failedMessage.forEach(({ reason }) => {
        this.logger.error(reason);
      });

      await this.prismaService.eventHistory.updateMany({
        where: { id: { in: failedMessageEventHistoryIds } },
        data: { status: EventStatus.FAILED },
      });
    }
  }
}
