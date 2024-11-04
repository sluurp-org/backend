import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { kst } from 'src/common/utils/kst';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { FindStoreAnalyticsQueryDto } from './dto/req/find-store-analytics-query.dto';
import { FindWorkspaceAnalyticsQueryDto } from './dto/req/find-workspace-analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  public async findDailyStoreAnalytics(
    workspaceId: number,
    storeId: number,
    dto: FindStoreAnalyticsQueryDto,
  ) {
    const { startDate, endDate } = dto;
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, deletedAt: null, workspaceId },
    });
    if (!store) throw new NotFoundException('스토어를 찾을 수 없습니다.');

    const dailyAnalytics =
      await this.prismaService.dailyStoreStatistics.findMany({
        where: {
          storeId,
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

    return dailyAnalytics;
  }

  public async findMonthlyStoreAnalytics(
    workspaceId: number,
    storeId: number,
    dto: FindStoreAnalyticsQueryDto,
  ) {
    const { startDate, endDate } = dto;
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, deletedAt: null, workspaceId },
    });
    if (!store) throw new NotFoundException('스토어를 찾을 수 없습니다.');

    const monthlyAnalytics =
      await this.prismaService.monthlyStoreStatistics.findMany({
        where: {
          storeId,
          orderMonth: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

    return monthlyAnalytics;
  }

  public async findDailyWorkspaceAnalytics(
    workspaceId: number,
    dto: FindWorkspaceAnalyticsQueryDto,
  ) {
    const { startDate, endDate } = dto;

    const dailyAnalytics =
      await this.prismaService.dailyWorkspaceStatistics.findMany({
        where: {
          workspaceId,
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

    return dailyAnalytics;
  }

  public async findMonthlyWorkspaceAnalytics(
    workspaceId: number,
    dto: FindWorkspaceAnalyticsQueryDto,
  ) {
    const { startDate, endDate } = dto;

    const monthlyAnalytics =
      await this.prismaService.monthlyWorkspaceStatistics.findMany({
        where: {
          workspaceId,
          orderMonth: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

    return monthlyAnalytics;
  }

  private async getAnalytics(
    entityType: 'storeId' | 'workspaceId',
    startDate: Date,
    endDate: Date,
  ) {
    const analyticsData = await this.prismaService.order.groupBy({
      by: [entityType, 'status'],
      where: {
        workspace: { deletedAt: null },
        store: { deletedAt: null },
        deletedAt: null,
        orderAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
      _sum: { quantity: true, price: true },
    });

    return analyticsData.reduce<Record<number, any>>((acc, order) => {
      const id = order[entityType];
      const { status, _sum: orderSum, _count: orderCount } = order;

      if (!acc[id]) {
        acc[id] = {
          [entityType]: id,
          totalOrders: 0,
          totalQuantity: 0,
          totalSales: 0,
          totalRefund: 0,
          totalCancelled: 0,
        };
      }

      acc[id].totalOrders += orderCount.id;
      acc[id].totalQuantity += orderSum.quantity || 0;
      acc[id].totalSales += orderSum.price || 0;

      if (status === OrderStatus.REFUND) acc[id].totalRefund += orderCount.id;

      return acc;
    }, {});
  }

  private getPreviousDayRange() {
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    return {
      start: kst(startOfDay(yesterday)),
      end: kst(endOfDay(yesterday)),
    };
  }

  private getPreviousMonthRange() {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);

    return {
      start: kst(startOfMonth(currentDate)),
      end: kst(endOfMonth(currentDate)),
    };
  }

  private async generateStoreDailyAnalytics() {
    const { start: yesterdayStart, end: yesterdayEnd } =
      this.getPreviousDayRange();

    const analyticsData = await this.getAnalytics(
      'storeId',
      yesterdayStart,
      yesterdayEnd,
    );

    await this.prismaService.$transaction(
      Object.values(analyticsData).map((data) =>
        this.prismaService.dailyStoreStatistics.upsert({
          where: {
            storeId_orderDate: {
              storeId: data.storeId,
              orderDate: yesterdayStart,
            },
          },
          create: { ...data, orderDate: yesterdayStart },
          update: data,
        }),
      ),
    );
  }

  private async generateStoreMonthlyAnalytics() {
    const { start: startDate, end: endDate } = this.getPreviousMonthRange();
    const analyticsData = await this.getAnalytics(
      'storeId',
      startDate,
      endDate,
    );

    await this.prismaService.$transaction(
      Object.values(analyticsData).map((data) =>
        this.prismaService.monthlyStoreStatistics.upsert({
          where: {
            storeId_orderMonth: {
              storeId: data.storeId,
              orderMonth: startDate,
            },
          },
          create: { ...data, orderMonth: startDate },
          update: data,
        }),
      ),
    );
  }

  private async generateWorkspaceDailyAnalytics() {
    const { start: yesterdayStart, end: yesterdayEnd } =
      this.getPreviousDayRange();

    const analyticsData = await this.getAnalytics(
      'workspaceId',
      yesterdayStart,
      yesterdayEnd,
    );

    await this.prismaService.$transaction(
      Object.values(analyticsData).map((data) =>
        this.prismaService.dailyWorkspaceStatistics.upsert({
          where: {
            workspaceId_orderDate: {
              workspaceId: data.workspaceId,
              orderDate: yesterdayStart,
            },
          },
          create: { ...data, orderDate: yesterdayStart },
          update: data,
        }),
      ),
    );
  }

  private async generateWorkspaceMonthlyAnalytics() {
    const { start: startDate, end: endDate } = this.getPreviousMonthRange();

    const analyticsData = await this.getAnalytics(
      'workspaceId',
      startDate,
      endDate,
    );

    await this.prismaService.$transaction(
      Object.values(analyticsData).map((data) =>
        this.prismaService.monthlyWorkspaceStatistics.upsert({
          where: {
            workspaceId_orderMonth: {
              workspaceId: data.workspaceId,
              orderMonth: startDate,
            },
          },
          create: { ...data, orderMonth: startDate },
          update: data,
        }),
      ),
    );
  }

  public async generateDailyAnalytics() {
    const generatedDailyAnalytics = await Promise.allSettled([
      this.generateStoreDailyAnalytics(),
      this.generateWorkspaceDailyAnalytics(),
    ]);

    await Promise.all(
      generatedDailyAnalytics.map(async (result) => {
        if (result.status === 'rejected') {
          await this.telegramService.sendMessage({
            fetal: true,
            message: `일일 분석 생성에 실패했습니다.`,
            context: AnalyticsService.name,
            error: result.reason,
          });
        }
      }),
    );
  }

  public async generateMonthlyAnalytics() {
    const generatedMonthlyAnalytics = await Promise.allSettled([
      this.generateStoreMonthlyAnalytics(),
      this.generateWorkspaceMonthlyAnalytics(),
    ]);

    await Promise.all(
      generatedMonthlyAnalytics.map(async (result) => {
        if (result.status === 'rejected') {
          await this.telegramService.sendMessage({
            fetal: true,
            message: `월별 분석 생성에 실패했습니다.`,
            context: AnalyticsService.name,
            error: result.reason,
          });
        }
      }),
    );
  }
}
