import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Order,
  OrderCreatedBy,
  OrderHistoryType,
  OrderStatus,
  Prisma,
} from '@prisma/client';
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
import { EventService } from 'src/event/event.service';
import { randomUUID } from 'crypto';
import { FindOrderHistoryQueryDto } from './dto/req/find-order-history-query.dto';
import { differenceInDays } from 'date-fns';

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
      productId,
      orderId,
      productOrderId,
      status,
      storeId,
      startDate,
      endDate,
    }: FindOrderQueryDto,
  ) {
    if (startDate && endDate && startDate > endDate)
      throw new BadRequestException(
        '시작일자가 종료일자보다 늦을 수 없습니다.',
      );

    if (startDate && endDate && differenceInDays(endDate, startDate) > 60)
      throw new BadRequestException('조회 기간은 60일 이내로 설정 가능합니다.');

    return this.prismaService.order.findMany({
      where: {
        workspaceId,
        id,
        orderId: { contains: orderId },
        productOrderId: { contains: productOrderId },
        productId,
        status,
        storeId,
        ...(startDate && endDate
          ? { createdAt: { gte: startDate, lte: endDate } }
          : {}),
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
    {
      id,
      orderId,
      productOrderId,
      status,
      storeId,
      productId,
      startDate,
      endDate,
    }: FindOrderQueryDto,
  ): Promise<number> {
    return await this.prismaService.order.count({
      where: {
        workspaceId,
        id,
        orderId: { contains: orderId },
        productOrderId: { contains: productOrderId },
        productId,
        status,
        storeId,
        ...(startDate && endDate
          ? { createdAt: { gte: startDate, lte: endDate } }
          : {}),
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
        createdBy: OrderCreatedBy.SYSTEM,
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

    const order = await this.prismaService.order.create({
      data: {
        ...dto,
        orderId: randomUUID(),
        productOrderId: randomUUID(),
        workspaceId,
        orderAt: orderAt || new Date(),
        receiverName: receiverName || ordererName,
        receiverPhone: receiverPhone || ordererPhone,
        createdBy: OrderCreatedBy.USER,
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
        order.product.disableGlobalEvent,
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
    dto: FindOrderHistoryQueryDto,
  ) {
    const { take, skip, type } = dto;
    return this.prismaService.orderHistory.findMany({
      where: {
        orderId,
        order: {
          workspaceId,
        },
        type,
      },
      include: {
        eventHistory: {
          include: {
            event: true,
            message: true,
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

  public async countHistory(
    workspaceId: number,
    orderId: number,
    dto: FindOrderHistoryQueryDto,
  ) {
    const { type } = dto;
    return this.prismaService.orderHistory.count({
      where: {
        orderId,
        order: {
          workspaceId,
        },
        type,
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
      select: { id: true, disableGlobalEvent: true },
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
        ...data,
        workspaceId,
        storeId,
        orderId,
        productOrderId,
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
    disableGlobalEvent: boolean,
    productId: number | null,
    productVariantId: number | undefined | null,
    type: OrderStatus,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.event.findMany({
      where: {
        workspaceId,
        type,
        enabled: true,
        OR: [
          ...(productId ? [{ productId }] : []),
          ...(productVariantId ? [{ productVariantId }] : []),
          ...(!disableGlobalEvent
            ? [{ productId: null, productVariantId: null }]
            : []),
        ],
      },
      include: {
        message: { include: { contentGroup: true } },
      },
    });
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
          productVariantName || '-',
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
        product.disableGlobalEvent,
        product?.id,
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
