import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindEventQueryDto } from './dto/req/find-event-query.dto';
import { CreateEventBodyDto } from './dto/req/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/req/update-event-body.dto';
import { FindEventHistoryQueryDto } from './dto/req/find-event-history-query.dto';
import {
  EventStatus,
  MessageTarget,
  Order,
  OrderHistoryType,
  Prisma,
  Variables,
} from '@prisma/client';

import { ContentService } from 'src/content/content.service';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly contentService: ContentService,
  ) {}

  public async findMany(workspaceId: number, dto: FindEventQueryDto) {
    const { take, skip, id, messageId, productId, productVariantId } = dto;

    return this.prismaService.event.findMany({
      where: {
        workspaceId,
        id,
        messageId,
        productId,
        productVariantId,
      },
      take,
      skip,
      orderBy: { id: 'desc' },
      include: { message: true, product: true, productVariant: true },
    });
  }

  public async count(workspaceId: number, dto: FindEventQueryDto) {
    const { id, messageId, productId, productVariantId } = dto;

    return this.prismaService.event.count({
      where: {
        workspaceId,
        id,
        messageId,
        productId: productId ? productId : null,
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

  private calculateScheduledAt(
    sendHour: number | null,
    delayDays: number | null,
  ): Date {
    const now = new Date();

    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    if (delayDays) kstNow.setDate(kstNow.getDate() + delayDays);
    if (sendHour) kstNow.setHours(sendHour, 0, 0, 0);

    return new Date(kstNow.getTime() - 9 * 60 * 60 * 1000);
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
      | 'event'
      | 'order'
      | 'contents'
      | 'status'
      | 'message'
      | 'rawMessage'
      | 'receiverPhone'
      | 'receiverEmail'
      | 'scheduledAt'
    >
  > {
    const {
      id: orderId,
      ordererPhone,
      receiverPhone: orderReceiverPhone,
      quantity,
    } = order;
    const {
      id: eventId,
      delayDays,
      sendHour,
      message: { id: messageId, contentGroup, target, customPhone },
    } = event;

    let receiverPhone = orderReceiverPhone;

    if (target === MessageTarget.CUSTOM && customPhone)
      receiverPhone = customPhone;

    if (target === MessageTarget.BUYER && ordererPhone)
      receiverPhone = ordererPhone;

    if (target === MessageTarget.RECEIVER && orderReceiverPhone)
      receiverPhone = orderReceiverPhone;

    const defaultInput: Pick<
      Prisma.EventHistoryCreateInput,
      'message' | 'event' | 'order' | 'status' | 'receiverPhone' | 'scheduledAt'
    > = {
      message: { connect: { id: messageId } },
      event: { connect: { id: eventId } },
      order: { connect: { id: orderId } },
      status: EventStatus.FAILED,
      receiverPhone,
      scheduledAt:
        sendHour || delayDays
          ? this.calculateScheduledAt(sendHour, delayDays)
          : new Date(),
    };

    if (contentGroup) {
      try {
        const { id: contentGroupId, expireMinute, oneTime } = contentGroup;

        const contentQuantity = quantity || 1;
        const contents = await this.contentService.findAvailableContent(
          contentGroupId,
          contentQuantity,
          transaction,
        );

        if (contents.length !== contentQuantity)
          return {
            ...defaultInput,
            rawMessage: '디지털 컨텐츠 재고가 부족합니다.',
          };

        if (oneTime)
          await this.contentService.markContentAsUsed(
            contentGroupId,
            contents.map(({ id }) => id),
            transaction,
          );

        const expireAt = new Date();
        if (expireMinute) {
          expireAt.setMinutes(expireAt.getMinutes() + expireMinute);
        }

        return {
          ...defaultInput,
          status: EventStatus.CONTENT_READY,
          contents: {
            createMany: {
              data: contents.map(({ id, contentGroup }) => ({
                contentId: id,
                expiredAt: expireMinute ? expireAt : null,
                downloadLimit: contentGroup.downloadLimit,
              })),
            },
          },
        };
      } catch (error) {
        return {
          ...defaultInput,
          rawMessage: error.message,
        };
      }
    }

    if (!receiverPhone)
      return {
        ...defaultInput,
        rawMessage: '수신자 전화번호가 유효하지 않습니다.',
      };

    try {
      return {
        ...defaultInput,
        status: EventStatus.CONTENT_READY,
      };
    } catch (error) {
      return {
        ...defaultInput,
        rawMessage: error.message,
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
          const { rawMessage } = eventHistoryInput;

          const eventHistory = await transaction.eventHistory.create({
            data: {
              ...eventHistoryInput,
              workspace: { connect: { id: workspaceId } },
              orderHistory: {
                create: {
                  orderId,
                  storeId,
                  workspaceId,
                  message: rawMessage || '',
                  type: OrderHistoryType.EVENT,
                },
              },
            },
            include: { message: { include: { kakaoTemplate: true } } },
          });

          return {
            eventHistory,
            order,
          };
        }),
      );
    });
  }

  private replaceVariables(
    content: string,
    variables: Record<string, string>,
    availableVariables: Variables[],
  ) {
    const keyToVarName = availableVariables.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return content.replace(/#\{([^}]+)\}/g, (match, p1) => {
      const varName = keyToVarName[p1];
      if (varName && variables[varName] !== undefined) {
        return variables[varName] || '-';
      } else {
        return match || '-';
      }
    });
  }

  private createMessageBody(
    eventHistory: Prisma.EventHistoryGetPayload<{
      include: {
        message: {
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
    const { message, id: eventHistoryId } = eventHistory;
    if (!message?.kakaoTemplate) throw new Error('메시지가 존재하지 않습니다.');

    const { kakaoTemplate, content } = message;
    const { product, productVariant, store, orderAt, ...orderRest } = order;

    const variableBody = {
      storeName: store.name || '-',
      eventId: eventHistoryId.toString() || '-',
      productName: product?.name || '-',
      productVariantName: productVariant?.name || '-',
      orderAt: orderAt
        ? format(orderAt, 'yyyy-MM-dd HH:mm', {
            locale: ko,
          })
        : '-',
      ...Object.fromEntries(
        Object.entries(orderRest).map(([key, value]) => [
          key,
          value?.toString() || '-',
        ]),
      ),
    };

    const messageVariables = variables.reduce((acc, variable) => {
      const { key, value } = variable;
      return {
        ...acc,
        [`#{${key}}`]: variableBody[value] || '-',
      };
    }, []);

    if (kakaoTemplate.isCustomAvailable) {
      const replacedContent = this.replaceVariables(
        content || '-',
        variableBody,
        variables,
      );

      messageVariables['#{상품안내}'] = replacedContent;
    }

    return {
      messageContent: kakaoTemplate.content,
      messageVariables,
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
      `${successedMessage.length}개의 메시지 바디를 생성하였습니다.`,
    );

    const failedMessage = messageBodies.filter(
      (messageBody) => messageBody.status === 'rejected',
    );
    const failedMessageEventHistoryIds = failedMessage.map((item) => item.id);

    if (failedMessage.length) {
      this.logger.error(
        `${failedMessage.length}개의 메시지 바디를 생성하는데 실패하였습니다.`,
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
