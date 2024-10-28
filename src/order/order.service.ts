import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Order, OrderHistoryType, OrderStatus, Prisma } from '@prisma/client';
import { FindOrderQueryDto } from './dto/req/find-order-query.dto';
import { FindOrdersBatchBodyDto } from './dto/req/find-orders-batch-body.dto';
import {
  UpsertOrderBodyDto,
  UpsertOrdersBatchBodyDto,
} from './dto/req/upsert-orders-batch-body.dto';
import { CreateOrderBodyDto } from './dto/req/create-order-body.dto';
import { FindOrdersBatchResponseDto } from './dto/res/find-orders-batch-response.dto';
import { FindOrderBatchQueryDto } from './dto/req/find-order-batch-query.dto';
import { UpdateOrderBodyDto } from './dto/req/update-order-body';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';
import { EventService } from 'src/event/event.service';
import { randomUUID } from 'crypto';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) {}

  public async findOne(
    workspaceId: number,
    orderId: number,
  ): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: {
        workspaceId,
        id: orderId,
        deletedAt: null,
        store: {
          deletedAt: null,
        },
      },
      include: {
        product: true,
        store: true,
      },
    });
    if (!order) throw new NotFoundException('주문 정보를 찾을 수 없습니다.');

    return order;
  }

  public async findMany(
    workspaceId: number,
    {
      take,
      skip,
      id,
      orderId,
      productOrderId,
      status,
      storeId,
    }: FindOrderQueryDto,
  ) {
    return this.prismaService.order.findMany({
      where: {
        workspaceId,
        id,
        orderId,
        productOrderId,
        status,
        storeId,
        deletedAt: null,
        store: {
          deletedAt: null,
        },
      },
      include: {
        product: true,
        productVariant: true,
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
  }

  public async count(
    workspaceId: number,
    { id, orderId, productOrderId, status, storeId }: FindOrderQueryDto,
  ): Promise<number> {
    return await this.prismaService.order.count({
      where: {
        workspaceId,
        id,
        orderId,
        productOrderId,
        status,
        storeId,
        deletedAt: null,
        store: {
          deletedAt: null,
        },
      },
    });
  }

  public async findManyByBatchQuery(
    { status, storeId }: FindOrderBatchQueryDto,
    workspaceId?: number,
  ): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where: {
        workspaceId,
        status,
        storeId,
        deletedAt: null,
        store: {
          deletedAt: null,
        },
      },
    });
  }

  public async create(workspaceId: number, dto: CreateOrderBodyDto) {
    const { orderAt, ordererName, ordererPhone, receiverName, receiverPhone } =
      dto;

    console.log('order create');

    const order = await this.prismaService.order.create({
      data: {
        orderId: randomUUID(),
        productOrderId: randomUUID(),
        workspaceId,
        orderAt: orderAt || new Date(),
        receiverName: receiverName || ordererName,
        receiverPhone: receiverPhone || ordererPhone,
        ...dto,
      },
      include: {
        product: true,
        productVariant: true,
        store: true,
      },
    });

    try {
      const events = await this.findEvents(
        workspaceId,
        order.productId,
        order.productVariantId,
        order.status,
      );

      await this.eventService.createEventHistoryBody([
        {
          order,
          events,
        },
      ]);
    } catch (error) {
      this.logger.error(error, error.stack, OrderService.name);
    }

    return order;
  }

  public async update(
    workspaceId: number,
    orderId: number,
    dto: UpdateOrderBodyDto,
  ) {
    const order = await this.findOne(workspaceId, orderId);
    if (!order) throw new NotFoundException('주문 정보를 찾을 수 없습니다.');

    return this.prismaService.order.update({
      where: { workspaceId, id: orderId, deletedAt: null },
      data: dto,
    });
  }

  public async delete(workspaceId: number, orderId: number) {
    const order = await this.findOne(workspaceId, orderId);
    if (!order) throw new NotFoundException('주문 정보를 찾을 수 없습니다.');

    return this.prismaService.order.update({
      where: { workspaceId, id: orderId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  public async findManyByBatchBody(
    batchDto: FindOrdersBatchBodyDto,
  ): Promise<FindOrdersBatchResponseDto[]> {
    return await this.prismaService.$transaction(async (tx) => {
      return await Promise.all(
        batchDto.orders.map(async (order) => {
          const { storeId, orderId, productOrderId } = order;

          const orderItem = await tx.order.findUnique({
            where: {
              orderId_productOrderId_storeId: {
                orderId,
                storeId,
                productOrderId,
              },
              deletedAt: null,
            },
          });

          return {
            storeId,
            productOrderId,
            orderId,
            isExist: !!orderItem,
          };
        }),
      );
    });
  }

  public async findHistory(
    workspaceId: number,
    orderId: number,
    dto: PaginationQueryDto,
  ) {
    const { take, skip } = dto;
    return this.prismaService.orderHistory.findMany({
      where: {
        orderId,
        order: {
          workspaceId,
        },
      },
      include: {
        eventHistory: {
          include: {
            event: true,
            messageTemplate: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
      take,
      skip,
    });
  }

  public async countHistory(workspaceId: number, orderId: number) {
    return this.prismaService.orderHistory.count({
      where: {
        orderId,
        order: {
          workspaceId,
        },
      },
    });
  }

  private async findOrCreateProduct(
    workspaceId: number,
    storeId: number,
    productId: string,
    productName: string,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.product.upsert({
      where: { productId_storeId: { productId, storeId } },
      create: { workspaceId, storeId, productId, name: productName },
      update: { deletedAt: null },
      select: { id: true },
    });
  }

  private async findOrCreateProductVariant(
    productId: number,
    variantId: string,
    variantName: string,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.productVariant.upsert({
      where: { variantId_productId: { variantId, productId } },
      create: { productId, variantId, name: variantName },
      update: { deletedAt: null },
      select: { id: true },
    });
  }

  private async findBatchOrder(
    orderId: string,
    storeId: number,
    productOrderId: string,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.order.findUnique({
      where: {
        orderId_productOrderId_storeId: {
          orderId,
          storeId,
          productOrderId,
        },
        deletedAt: null,
      },
    });
  }

  private async upsertOrder(
    data: Prisma.OrderUncheckedCreateInput,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const { orderId, productOrderId, storeId, workspaceId } = data;
    return transaction.order.upsert({
      where: {
        orderId_productOrderId_storeId: {
          orderId,
          storeId,
          productOrderId,
        },
      },
      update: {
        ...data,
      },
      create: {
        workspaceId,
        storeId,
        orderId,
        productOrderId,
        ...data,
      },
      include: {
        store: true,
        product: true,
        productVariant: true,
      },
    });
  }

  private async findEvents(
    workspaceId: number,
    productId: number,
    productVariantId: number | null,
    type: OrderStatus,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const events = await transaction.event.findMany({
      where: {
        workspaceId,
        type,
        product: { id: productId, deletedAt: null },
        OR: [
          {
            productVariant: productVariantId
              ? { id: productVariantId, deletedAt: null }
              : null,
          },
          { productVariant: null },
        ],
        message: {
          readonly: false,
        },
      },
      include: {
        message: { include: { contentGroup: true } },
      },
    });

    return events.filter(
      (event) =>
        !event.message.contentGroup?.readonly || !event.message.contentGroup,
    );
  }

  private async processBatchUpdateOrder(
    order: UpsertOrderBodyDto,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    const {
      productOrderId,
      orderId,
      storeId,
      productId,
      productName,
      productVariantId,
      productVariantName,
      ...rest
    } = order;

    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, deletedAt: null },
    });
    if (!store) throw new NotFoundException('스토어 미존재');

    const { workspaceId } = store;
    const product = await this.findOrCreateProduct(
      workspaceId,
      storeId,
      productId,
      productName,
      transaction,
    );

    const productVariant = productVariantId
      ? await this.findOrCreateProductVariant(
          product.id,
          productVariantId,
          productVariantName,
          transaction,
        )
      : null;

    const [previousOrder, updatedOrder] = await Promise.all([
      this.findBatchOrder(orderId, storeId, productOrderId),
      this.upsertOrder(
        {
          workspaceId,
          storeId,
          orderId,
          productOrderId,
          productId: product.id,
          productVariantId: productVariant?.id,
          ...rest,
        },
        transaction,
      ),
    ]);

    if (previousOrder?.status !== updatedOrder.status) {
      const events = await this.findEvents(
        workspaceId,
        product.id,
        productVariant?.id,
        updatedOrder.status,
        transaction,
      );

      return {
        events,
        order: updatedOrder,
        isStatusChanged: true,
      };
    }

    return {
      events: [],
      order: updatedOrder,
      isStatusChanged: false,
    };
  }

  private async createChangeOrderHistory(
    order: {
      id: number;
      status: OrderStatus;
      storeId: number;
      workspaceId: number;
    }[],
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    if (order.length === 0) return;

    return transaction.orderHistory.createMany({
      data: order.map((order) => ({
        orderId: order.id,
        type: OrderHistoryType.STATUS_CHANGE,
        changedStatus: order.status,
        storeId: order.storeId,
        workspaceId: order.workspaceId,
        message: `주문 상태가 ${order.status}로 변경되었습니다.`,
      })),
    });
  }

  public async updateBatchOrders(batchDto: UpsertOrdersBatchBodyDto) {
    const { orders } = batchDto;

    const orderEvents = await this.prismaService.$transaction(
      async (transaction) => {
        const updatedOrders = await Promise.allSettled(
          orders.map((order) =>
            this.processBatchUpdateOrder(order, transaction),
          ),
        );

        const failedUpdatedOrders = updatedOrders
          .filter((result) => result.status === 'rejected')
          .map((result) => {
            console.error(result);
            return result.reason;
          });

        if (failedUpdatedOrders.length > 0) {
          this.logger.error(failedUpdatedOrders);
        }

        const orderHistory = updatedOrders
          .filter((result) => result.status === 'fulfilled')
          .filter((result) => result.value.isStatusChanged)
          .map((result) => {
            const { order } = result.value;

            return {
              id: order.id,
              status: order.status,
              storeId: order.storeId,
              workspaceId: order.workspaceId,
            };
          });

        await this.createChangeOrderHistory(orderHistory, transaction);

        const orderEvents = updatedOrders
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);

        return orderEvents;
      },
    );

    await this.eventService.createEventHistoryBody(orderEvents);
    return orderEvents;
  }
}
