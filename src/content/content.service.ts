import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(workspaceId: number, paginationQueryDto: PaginationQueryDto) {
    const { skip, take } = paginationQueryDto;

    const nodes = await this.prismaService.contentGroup.findMany({
      where: { workspaceId, deletedAt: null },
      skip,
      take,
    });
    const total = await this.prismaService.contentGroup.count({
      where: { workspaceId, deletedAt: null },
    });

    return { nodes, total };
  }

  async findOne(workspaceId: number, contentId: number) {
    return this.prismaService.contentGroup.findUnique({
      where: { id: contentId, workspaceId },
    });
  }

  async create(workspaceId: number, data: any) {
    return this.prismaService.contentGroup.create({
      data: { ...data, workspaceId },
    });
  }

  async update(workspaceId: number, contentId: number, data: any) {
    return this.prismaService.contentGroup.update({
      where: { id: contentId, workspaceId },
      data,
    });
  }

  async delete(workspaceId: number, contentId: number) {
    return this.prismaService.contentGroup.update({
      where: { id: contentId, workspaceId },
      data: { deletedAt: new Date() },
    });
  }
}
