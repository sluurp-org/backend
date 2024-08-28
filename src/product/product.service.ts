import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetProductDto } from './dto/get-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  public async findMany(workspaceId: number, getProductDto: GetProductDto) {
    const { take, skip, storeType, name } = getProductDto;

    const nodes = await this.prismaService.product.findMany({
      where: {
        name: name && { contains: name },
        workspaceId,
        deletedAt: null,
        store: {
          type: storeType,
          enabled: true,
          deletedAt: null,
        },
      },
      include: { store: true },
      take,
      skip,
    });
    const total = await this.prismaService.product.count({
      where: {
        workspaceId,
        deletedAt: null,
        name: name && { contains: name },
        store: { type: storeType, enabled: true, deletedAt: null },
      },
    });

    return { nodes, total };
  }

  public async findOne(productId: number, id: number) {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        workspaceId: id,
        deletedAt: null,
        store: {
          enabled: true,
          deletedAt: null,
        },
      },
      include: { store: true, event: true },
    });
  }
}
