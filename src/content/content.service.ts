import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentGroupBodyDto } from './dto/req/create-content-group-body.dto';
import { UpdateContentGroupBodyDto } from './dto/req/update-content-group-body.dto';
import { FindContentGroupQueryDto } from './dto/req/find-content-group-query.dto';
import { FindContentQueryDto } from './dto/req/find-content-query.dto copy';
import { CreateContentBodyDto } from './dto/req/create-content-body.dto';
import { ContentStatus, ContentType, Prisma } from '@prisma/client';
import { isNumber, isURL } from 'class-validator';
import { UpdateContentBodyDto } from './dto/req/update-content-body.dto.ts';
import { CreateContentFileBodyDto } from './dto/req/create-content-file-body.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  public async findAllGroup(
    workspaceId: number,
    dto: FindContentGroupQueryDto,
  ) {
    const { skip, take, name, oneTime, type } = dto;

    return this.prismaService.contentGroup.findMany({
      where: { workspaceId, deletedAt: null, name, oneTime, type },
      skip,
      take,
    });
  }

  public async countGroup(workspaceId: number, dto: FindContentGroupQueryDto) {
    const { name, oneTime, type } = dto;

    return this.prismaService.contentGroup.count({
      where: { workspaceId, deletedAt: null, name, oneTime, type },
    });
  }

  public async findOneGroup(workspaceId: number, contentId: number) {
    const group = await this.prismaService.contentGroup.findUnique({
      where: { id: contentId, workspaceId },
    });
    if (!group) throw new NotFoundException('컨텐츠 그룹을 찾을 수 없습니다.');

    return group;
  }

  public async createGroup(
    workspaceId: number,
    data: CreateContentGroupBodyDto,
  ) {
    return this.prismaService.contentGroup.create({
      data: { ...data, workspaceId },
    });
  }

  public async updateGroup(
    workspaceId: number,
    contentId: number,
    data: UpdateContentGroupBodyDto,
  ) {
    return this.prismaService.contentGroup.update({
      where: { id: contentId, workspaceId },
      data,
    });
  }

  public async deleteGroup(workspaceId: number, contentId: number) {
    return await this.prismaService.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: { workspaceId, contentGroupId: contentId },
        data: { contentGroupId: null },
      });

      return await tx.contentGroup.update({
        where: { id: contentId, workspaceId },
        data: { deletedAt: new Date() },
      });
    });
  }

  public async findAllContent(
    workspaceId: number,
    contentGroupId: number,
    dto: FindContentQueryDto,
  ) {
    const { skip, take, isUsed } = dto;

    return this.prismaService.content.findMany({
      where: {
        workspaceId,
        contentGroupId,
        deletedAt: null,
        used: isUsed,
        status: ContentStatus.READY,
      },
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  }

  public async countContent(
    id: number,
    contentGroupId: number,
    dto: FindContentQueryDto,
  ) {
    const { isUsed } = dto;

    return this.prismaService.content.count({
      where: {
        workspaceId: id,
        contentGroupId,
        deletedAt: null,
        used: isUsed,
        status: ContentStatus.READY,
      },
    });
  }

  private validateContentGroupType(type: ContentType, data: string[] | string) {
    if (type !== ContentType.FILE) {
      const text = Array.isArray(data) ? data : [data];

      text.forEach((t) => {
        if (type === ContentType.URL && !isURL(t)) {
          throw new BadRequestException('URL 형식이 아닙니다.');
        }

        if (type === ContentType.BARCODE && !isNumber(parseInt(t))) {
          throw new BadRequestException('숫자 형식이 아닙니다.');
        }

        if (type === ContentType.TEXT && typeof t !== 'string') {
          throw new BadRequestException('문자열 형식이 아닙니다.');
        }
      });
    }
  }

  public async findOneContent(
    id: number,
    contentGroupId: number,
    contentId: number,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
        workspaceId: id,
        contentGroupId,
      },
    });
    if (!content) throw new NotFoundException('컨텐츠를 찾을 수 없습니다.');

    return content;
  }

  public async createContent(
    id: number,
    contentGroupId: number,
    dto: CreateContentBodyDto,
  ) {
    const group = await this.findOneGroup(id, contentGroupId);
    const { text } = dto;

    this.validateContentGroupType(group.type, text);

    return await this.prismaService.$transaction(async (tx) => {
      if (group.oneTime) {
        return await tx.content.updateMany({
          where: { workspaceId: id, contentGroupId, used: false },
          data: { deletedAt: new Date() },
        });
      }

      return tx.content.createMany({
        data: text.map((t) => ({
          workspaceId: id,
          contentGroupId,
          text: t,
          type: group.type,
          status: ContentStatus.READY,
        })),
      });
    });
  }

  public async createContentFile(
    id: number,
    contentGroupId: number,
    dto: CreateContentFileBodyDto,
  ) {
    const group = await this.findOneGroup(id, contentGroupId);
    if (group.type !== ContentType.FILE) {
      throw new BadRequestException('파일 형식이 아닙니다.');
    }

    const content = await this.prismaService.content.create({
      data: {
        workspaceId: id,
        contentGroupId: group.id,
        ...dto,
        status: ContentStatus.PENDING,
      },
    });

    const key = `${contentGroupId}/${content.id}`;
    const url = await this.awsService.createUploadPresignedUrl(
      key,
      dto.mimeType,
    );

    return { ...content, url };
  }

  public async updateContent(
    id: number,
    contentGroupId: number,
    contentId: number,
    dto: UpdateContentBodyDto,
  ) {
    await this.findOneContent(id, contentGroupId, contentId);

    const { text, status } = dto;
    const group = await this.findOneGroup(id, contentGroupId);

    if (group.type === ContentType.FILE) {
      if (text !== undefined) {
        throw new BadRequestException('파일은 텍스트를 수정할 수 없습니다.');
      }

      return this.prismaService.content.update({
        where: { id: contentId, workspaceId: id, contentGroupId },
        data: { status },
      });
    }
    if (!text) throw new BadRequestException('수정할 값이 없습니다.');

    this.validateContentGroupType(group.type, text);
    return this.prismaService.content.update({
      where: { id: contentId, workspaceId: id, contentGroupId },
      data: { text },
    });
  }

  public async deleteContent(
    id: number,
    contentGroupId: number,
    contentId: number,
  ) {
    const content = await this.findOneContent(id, contentGroupId, contentId);
    if (content.used) {
      throw new BadRequestException('사용 중인 컨텐츠는 삭제할 수 없습니다.');
    }

    return this.prismaService.content.update({
      where: { id: contentId, workspaceId: id, contentGroupId },
      data: { deletedAt: new Date() },
    });
  }

  public async downloadContent(
    id: number,
    contentGroupId: number,
    contentId: number,
  ) {
    const content = await this.findOneContent(id, contentGroupId, contentId);
    if (content.status !== ContentStatus.READY) {
      throw new BadRequestException('파일이 준비되지 않았습니다.');
    }

    const key = `${contentGroupId}/${content.id}`;
    const { name, extension } = content;
    const encodedName = encodeURIComponent(name || '주문 파일');

    return this.awsService.createDownloadPresignedUrl(
      key,
      encodedName,
      extension,
    );
  }

  public async findAvailableContent(
    contentGroupId: number,
    quantity: number = 1,
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.content.findMany({
      where: {
        contentGroupId,
        used: false,
        deletedAt: null,
      },
      take: quantity,
      include: { contentGroup: true },
    });
  }

  public async markContentAsUsed(
    contentIds: number[],
    transaction: Prisma.TransactionClient = this.prismaService,
  ) {
    return transaction.content.updateMany({
      where: { id: { in: contentIds } },
      data: { used: true },
    });
  }
}
