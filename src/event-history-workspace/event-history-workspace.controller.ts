import { Body, Get, Param, Patch, Put, Query } from '@nestjs/common';
import { EventHistoryWorkspaceService } from './event-history-workspace.service';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { EventHistoryWorkspaceQueryDto } from './dto/req/event-history-query.dto';
import { EventHistoryWorkspaceUpdateBodyDto } from './dto/req/event-history-update-body.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { ApiTags } from '@nestjs/swagger';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { EventHistoryListDto } from './dto/res/event-history-list.dto';

@ApiTags('event-history')
@WorkspaceController('event-history')
export class EventHistoryWorkspaceController {
  constructor(
    private readonly eventHistoryWorkspaceService: EventHistoryWorkspaceService,
  ) {}

  @Get()
  @Serialize(EventHistoryListDto, true)
  @ApiOkResponsePaginated(EventHistoryListDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEventHistoryWorkspaces(
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Query() query: EventHistoryWorkspaceQueryDto,
  ) {
    const nodes = await this.eventHistoryWorkspaceService.findAll(
      workspaceId,
      query,
    );
    const total = await this.eventHistoryWorkspaceService.count(
      workspaceId,
      query,
    );
    return { nodes, total };
  }

  @Get(':eventHistoryId')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEventHistoryWorkspace(
    @Param('eventHistoryId') eventHistoryId: string,
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.eventHistoryWorkspaceService.findOne(
      workspaceId,
      eventHistoryId,
    );
  }

  @Patch(':eventHistoryId')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async updateEventHistoryWorkspace(
    @Param('eventHistoryId') eventHistoryId: string,
    @ReqWorkspace() { id: workspaceId }: Workspace,
    @Body() body: EventHistoryWorkspaceUpdateBodyDto,
  ) {
    return this.eventHistoryWorkspaceService.update(
      workspaceId,
      eventHistoryId,
      body,
    );
  }

  @Put(':eventHistoryId/reset-download-count')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async resetDownloadCount(
    @Param('eventHistoryId') eventHistoryId: string,
    @ReqWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.eventHistoryWorkspaceService.resetDownloadCount(
      workspaceId,
      eventHistoryId,
    );
  }
}
