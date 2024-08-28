import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindOrdersDto } from './dto/req/find-batch.dto';
import {
  OrderUpdateBatchBodyDto,
  UpdateOrdersDto,
} from './dto/req/upsert-batch.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { FindOrderQueryDto } from './dto/req/find-order-query.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(private readonly prismaService: PrismaService) {}

  public async findOrdersByFilter(dto: FindOrderQueryDto) {
    return await this.prismaService.order.findMany({
      where: {
        id: dto.id,
        productOrderId: dto.productOrderId,
        orderId: dto.orderId,
        status: dto.status,
        storeId: dto.storeId,
      },
    });
  }

  public async findOrders(batchDto: FindOrdersDto) {
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
            },
          });

          if (orderItem) return { ...order, isExist: true };
          return { ...order, isExist: false };
        }),
      );
    });
  }

  public async updateOrders(batchDto: UpdateOrdersDto) {
    return await this.prismaService.$transaction(async (tx) => {
      return await Promise.all(
        batchDto.orders.map((order) => this.processOrder(tx, order)),
      );
    });
  }

  private async processOrder(
    tx: Prisma.TransactionClient,
    order: OrderUpdateBatchBodyDto,
  ): Promise<any> {
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

    try {
      const store = await this.getStore(tx, storeId);
      const product = await this.upsertProduct(
        tx,
        store.workspaceId,
        storeId,
        productId,
        productName,
      );

      const productVariant = productVariantId
        ? await this.upsertProductVariant(
            tx,
            product.id,
            productVariantId,
            productVariantName,
          )
        : null;

      const previousOrder = await this.findPreviousOrder(
        tx,
        orderId,
        storeId,
        productOrderId,
      );

      const updatedOrder = await this.upsertOrder(
        tx,
        store.workspaceId,
        storeId,
        orderId,
        productOrderId,
        product.id,
        productVariant?.id,
        rest,
      );

      const events = [];
      if (previousOrder?.status !== updatedOrder.status) {
        const newEvents = await this.getEvents(
          tx,
          store.workspaceId,
          product.id,
          productVariant?.id,
          updatedOrder.status,
        );

        events.push(...newEvents);
      }

      return {
        ...updatedOrder,
        events,
        previousStatus: previousOrder?.status,
        isSuccess: true,
      };
    } catch (error) {
      this.logger.error(`Failed to process order ${orderId}: ${error.message}`);
      return { ...order, isSuccess: false };
    }
  }

  private async getStore(tx: Prisma.TransactionClient, storeId: number) {
    return tx.store.findUnique({
      where: { id: storeId },
      select: { id: true, workspaceId: true },
    });
  }

  private async getEvents(
    tx: Prisma.TransactionClient,
    workspaceId: number,
    productId: number,
    productVariantId: number | null,
    type: OrderStatus,
  ) {
    const event = await tx.event.findMany({
      where: {
        workspaceId,
        productId,
        productVariantId,
        type,
      },
      include: {
        message: {
          include: {
            kakaoTemplate: true,
            emailTemplate: true,
            webhookTemplate: true,
          },
        },
      },
    });

    return event.map((e) => e.message);
  }

  private async upsertProduct(
    tx: Prisma.TransactionClient,
    workspaceId: number,
    storeId: number,
    productId: string,
    productName: string,
  ) {
    return tx.product.upsert({
      where: { productId_storeId: { productId, storeId } },
      create: { workspaceId, storeId, productId, name: productName },
      update: {},
      select: { id: true },
    });
  }

  private async upsertProductVariant(
    tx: Prisma.TransactionClient,
    productId: number,
    variantId: string,
    variantName: string,
  ) {
    return tx.productVariant.upsert({
      where: { variantId_productId: { variantId, productId } },
      create: { productId, variantId, name: variantName },
      update: {},
      select: { id: true },
    });
  }

  private async findPreviousOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    storeId: number,
    productOrderId: string,
  ) {
    return tx.order.findUnique({
      where: {
        orderId_productOrderId_storeId: {
          orderId,
          storeId,
          productOrderId,
        },
      },
    });
  }

  private async upsertOrder(
    tx: Prisma.TransactionClient,
    workspaceId: number,
    storeId: number,
    orderId: string,
    productOrderId: string,
    productId: number,
    productVariantId: number | null,
    rest: any,
  ) {
    return tx.order.upsert({
      where: {
        orderId_productOrderId_storeId: {
          orderId,
          storeId,
          productOrderId,
        },
      },
      update: {
        productId,
        productVariantId,
        ...rest,
      },
      create: {
        workspaceId,
        storeId,
        orderId,
        productOrderId,
        productId,
        productVariantId,
        ...rest,
      },
    });
  }
}
