import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindProductQueryDto } from './dto/req/find-product-query.dto';
import { FindProductOptionQueryDto } from './dto/req/find-product-option-query.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  public async findMany(
    workspaceId: number,
    findProductQueryDto: FindProductQueryDto,
  ) {
    const { take, skip, storeId, name } = findProductQueryDto;

    return this.prismaService.product.findMany({
      where: {
        name: name && { contains: name },
        workspaceId,
        deletedAt: null,
        store: {
          id: storeId,
          enabled: true,
          deletedAt: null,
        },
      },
      include: { store: true },
      orderBy: { id: 'desc' },
      take,
      skip,
    });
  }

  public async count(
    workspaceId: number,
    findProductQueryDto: FindProductQueryDto,
  ) {
    const { storeId, name } = findProductQueryDto;

    return this.prismaService.product.count({
      where: {
        workspaceId,
        deletedAt: null,
        name: name && { contains: name },
        store: { id: storeId, enabled: true, deletedAt: null },
      },
    });
  }

  public async findOne(productId: number, workspaceId: number) {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
        workspaceId,
        deletedAt: null,
        store: {
          enabled: true,
          deletedAt: null,
        },
      },
      include: {
        store: true,
        event: {
          include: { message: true },
        },
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');

    return product;
  }

  public async findOptions(
    productId: number,
    workspaceId: number,
    dto: FindProductOptionQueryDto,
  ) {
    const { take, skip, name } = dto;

    return this.prismaService.productVariant.findMany({
      where: {
        productId,
        product: {
          workspaceId,
          deletedAt: null,
        },
        deletedAt: null,
        name: name && { contains: name },
      },
      include: {
        event: {
          include: { message: true },
        },
      },
      orderBy: { id: 'desc' },
      take,
      skip,
    });
  }

  public async countOptions(
    productId: number,
    workspaceId: number,
    dto: FindProductOptionQueryDto,
  ) {
    const { name } = dto;

    return this.prismaService.productVariant.count({
      where: {
        productId,
        product: {
          workspaceId,
          deletedAt: null,
        },
        deletedAt: null,
        name: name && { contains: name },
      },
    });
  }
}
