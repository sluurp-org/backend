import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { Get, Param, Query } from '@nestjs/common';
import { FindStoreAnalyticsQueryDto } from './dto/req/find-store-analytics-query.dto';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { Workspace } from '@prisma/client';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { MonthlyAnalyticsDto } from './dto/res/monthly-analytics.dto copy';
import { DailyAnalyticsDto } from './dto/res/daily-analytics.dto';

@ApiTags('analytics')
@WorkspaceController('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary: '일별 스토어 분석 조회',
    description: '일별 스토어 분석을 조회합니다.',
  })
  @Get(':storeId/daily')
  @WorkspaceAuth()
  @Serialize(DailyAnalyticsDto)
  @ApiOkResponse({
    type: [DailyAnalyticsDto],
  })
  public async findDailyStoreAnalytics(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('storeId') storeId: number,
    @Query() dto: FindStoreAnalyticsQueryDto,
  ) {
    return this.analyticsService.findDailyStoreAnalytics(
      workspaceId,
      storeId,
      dto,
    );
  }

  @ApiOperation({
    summary: '월별 스토어 분석 조회',
    description: '월별 스토어 분석을 조회합니다.',
  })
  @Get(':storeId/monthly')
  @WorkspaceAuth()
  @Serialize(MonthlyAnalyticsDto)
  @ApiOkResponse({
    type: [MonthlyAnalyticsDto],
  })
  public async findMonthlyStoreAnalytics(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Param('storeId') storeId: number,
    @Query() dto: FindStoreAnalyticsQueryDto,
  ) {
    return this.analyticsService.findMonthlyStoreAnalytics(
      workspaceId,
      storeId,
      dto,
    );
  }

  @ApiOperation({
    summary: '일별 워크스페이스 분석 조회',
    description: '일별 워크스페이스 분석을 조회합니다.',
  })
  @Get('daily')
  @WorkspaceAuth()
  @Serialize(DailyAnalyticsDto)
  @ApiOkResponse({
    type: [DailyAnalyticsDto],
  })
  public async findDailyWorkspaceAnalytics(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() dto: FindStoreAnalyticsQueryDto,
  ) {
    return this.analyticsService.findDailyWorkspaceAnalytics(workspaceId, dto);
  }

  @ApiOperation({
    summary: '월별 워크스페이스 분석 조회',
    description: '월별 워크스페이스 분석을 조회합니다.',
  })
  @Get('monthly')
  @WorkspaceAuth()
  @Serialize(MonthlyAnalyticsDto)
  @ApiOkResponse({
    type: [MonthlyAnalyticsDto],
  })
  public async findMonthlyWorkspaceAnalytics(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() dto: FindStoreAnalyticsQueryDto,
  ) {
    return this.analyticsService.findMonthlyWorkspaceAnalytics(
      workspaceId,
      dto,
    );
  }
}
