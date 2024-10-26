import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventHistoryWorkspaceQueryDto } from './dto/req/event-history-query.dto';
import { EventHistory } from '@prisma/client';
import { EventHistoryWorkspaceUpdateBodyDto } from './dto/req/event-history-update-body.dto';

@Injectable()
export class EventHistoryWorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  public async findOne(workspaceId: number, eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: {
        id: eventHistoryId,
        order: { workspaceId },
      },
      include: {
        contents: {
          include: {
            content: true,
          },
        },
        event: {
          include: {
            message: true,
          },
        },
      },
    });
    if (!eventHistory)
      throw new NotFoundException('이벤트 기록이 존재하지 않습니다.');

    return {
      ...eventHistory,
      eventMessage: eventHistory.event.message,
    };
  }

  public async findAll(
    workspaceId: number,
    query: EventHistoryWorkspaceQueryDto,
  ): Promise<EventHistory[]> {
    const { orderId, take, skip } = query;

    const eventHistories = await this.prisma.eventHistory.findMany({
      where: {
        order: { workspaceId, id: orderId },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
    return eventHistories;
  }

  public async count(
    workspaceId: number,
    query: EventHistoryWorkspaceQueryDto,
  ) {
    const { orderId } = query;

    const count = await this.prisma.eventHistory.count({
      where: {
        order: { workspaceId, id: orderId },
      },
    });
    return count;
  }

  public async update(
    workspaceId: number,
    eventHistoryContentId: number,
    body: EventHistoryWorkspaceUpdateBodyDto,
  ) {
    const updatedEventHistory =
      await this.prisma.eventHistoryContentConnection.update({
        where: { id: eventHistoryContentId, eventHistory: { workspaceId } },
        data: body,
      });

    return updatedEventHistory;
  }

  public async resetDownloadCount(
    workspaceId: number,
    eventHistoryContentId: number,
  ) {
    const updatedEventHistory =
      await this.prisma.eventHistoryContentConnection.update({
        where: { id: eventHistoryContentId, eventHistory: { workspaceId } },
        data: { downloadCount: 0 },
      });
    return updatedEventHistory;
  }
}
