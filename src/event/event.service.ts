import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindEventQueryDto } from './dto/req/find-event-query.dto';
import { CreateEventBodyDto } from './dto/req/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/req/update-event-body.dto';
import { FindEventHistoryQueryDto } from './dto/req/find-event-history-query.dto';
import { EventStatus, Order, OrderHistoryType, Prisma } from '@prisma/client';
import { SqsService } from '@ssut/nestjs-sqs';
import { MessageService } from 'src/message/message.service';
import { CreditService } from 'src/credit/credit.service';
import { ContentService } from 'src/content/content.service';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly messageService: MessageService,
    private readonly sqsService: SqsService,
    private readonly creditService: CreditService,
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
        content: true,
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
  ): Promise<Prisma.EventHistoryCreateInput> {
    const { id: orderId, receiverPhone, workspaceId } = order;
    const { id: eventId, message } = event;

    const workspaceSubscription =
      await this.workspaceService.findWorkspaceSubscription(workspaceId);

    if (!workspaceSubscription) {
      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        status: EventStatus.FAIL,
        message: '워크스페이스 구독 정보를 찾을 수 없습니다.',
      };
    }

    const { contentCredit, alimTalkCredit } = workspaceSubscription;

    if (message?.contentGroup) {
      try {
        const {
          id: contentGroupId,
          expireMinute,
          oneTime,
        } = message.contentGroup;

        const content = await this.contentService.findAvailableContent(
          contentGroupId,
          transaction,
        );

        if (oneTime) {
          await this.contentService.markContentAsUsed(content.id, transaction);
        }

        const { id: contentId } = content;
        const usedCredit = await this.creditService.use(workspaceId, {
          amount: contentCredit + alimTalkCredit,
          reason: '콘텐츠 메세지 발송 (알림톡 + 콘텐츠)',
        });

        const expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + expireMinute);

        return {
          event: { connect: { id: eventId } },
          order: { connect: { id: orderId } },
          credit: { connect: { id: usedCredit.id } },
          content: { connect: { id: contentId } },
          expiredAt: expireMinute ? expireAt : null,
          status: EventStatus.PROCESSING,
        };
      } catch (error) {
        return {
          event: { connect: { id: eventId } },
          order: { connect: { id: orderId } },
          status: EventStatus.FAIL,
          message: error.message,
        };
      }
    }

    if (!receiverPhone)
      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        message: '수신자 전화번호가 없습니다.',
        status: EventStatus.FAIL,
      };

    try {
      const usedCredit = await this.creditService.use(workspaceId, {
        amount: alimTalkCredit,
        reason: '알림톡 메세지 발송',
      });

      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        credit: { connect: { id: usedCredit.id } },
        status: EventStatus.PROCESSING,
      };
    } catch (error) {
      return {
        event: { connect: { id: eventId } },
        order: { connect: { id: orderId } },
        status: EventStatus.FAIL,
        message: error.message,
      };
    }
  }

  public async createOrderHistory(
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
              event: {
                include: {
                  message: {
                    include: {
                      kakaoTemplate: {
                        include: {
                          kakaoCredential: true,
                        },
                      },
                    },
                  },
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

  public async produceOrdersToSqs(
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

    const availableEvents = (
      await Promise.all(
        orders.map(async (payload) => {
          const orderHistory = await this.createOrderHistory(
            payload.order,
            payload.events,
          );
          return orderHistory;
        }),
      )
    )
      .flat()
      .filter(
        (event) =>
          event !== undefined &&
          event.eventHistory.status === EventStatus.PROCESSING,
      );

    const variables = await this.prismaService.variables.findMany();
    const availableMessages = availableEvents.map((eventPayload) => {
      const {
        eventHistory: {
          id: eventHistoryId,
          event: { message },
        },
        order,
      } = eventPayload;

      if (!message.variables) {
        return {
          eventId: eventPayload.eventHistory.id,
          channelId: message.kakaoTemplate.kakaoCredential.channelId,
          templateId: message.kakaoTemplate.templateId,
          phoneNumber: order.receiverPhone,
          variables: [],
        };
      }

      const { product, productVariant, store, ...orderRest } = order;
      const variableBody = {
        storeName: store.name,
        eventId: eventHistoryId,
        productName: product?.name,
        productVariantName: productVariant?.name,
        ...orderRest,
      };

      const replaceTargetVariables = [
        ...message.variables,
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
        eventId: eventHistoryId,
        channelId: message.kakaoTemplate.kakaoCredential.channelId,
        templateId: message.kakaoTemplate.templateId,
        variables: replacedVariables,
        phoneNumber: order.receiverPhone,
      };
    });

    const sqsMessages = availableMessages.map((message) => ({
      id: message.eventId + new Date().getTime().toString(),
      body: JSON.stringify(message),
    }));

    if (!sqsMessages.length) return;
    await this.sqsService.send('event', sqsMessages);
  }
}
