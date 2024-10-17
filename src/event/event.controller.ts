import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { FindEventQueryDto } from './dto/req/find-event-query.dto';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { EventDto } from './dto/res/event.dto';
import { CreateEventBodyDto } from './dto/req/create-event-body.dto';
import { FindEventHistoryQueryDto } from './dto/req/find-event-history-query.dto';
import { EventHistoryDto } from './dto/res/event-history.dto';

@ApiTags('event')
@WorkspaceController('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({
    summary: '이벤트 조회',
    description: '이벤트를 조회합니다.',
  })
  @ApiOkResponsePaginated(EventDto)
  @Serialize(EventDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEvents(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindEventQueryDto,
  ) {
    const nodes = await this.eventService.findMany(id, dto);
    const total = await this.eventService.count(id, dto);

    return {
      nodes,
      total,
    };
  }

  @Post()
  @ApiOperation({
    summary: '이벤트 생성',
    description: '이벤트를 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이벤트 생성 성공',
    type: EventDto,
  })
  @Serialize(EventDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async createEvent(
    @ReqWorkspace() { id }: Workspace,
    @Body() dto: CreateEventBodyDto,
  ) {
    return this.eventService.create(id, dto);
  }

  @Get('history')
  @ApiOperation({
    summary: '이벤트 히스토리 조회',
    description: '이벤트 히스토리를 조회합니다.',
  })
  @ApiOkResponsePaginated(EventHistoryDto)
  @Serialize(EventHistoryDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEventHistory(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindEventHistoryQueryDto,
  ) {
    const nodes = await this.eventService.findHistory(id, dto);
    const total = await this.eventService.countHistory(id, dto);

    return {
      nodes,
      total,
    };
  }

  @Get(':eventId')
  @ApiOperation({
    summary: '이벤트 조회',
    description: '이벤트를 조회합니다.',
  })
  @Serialize(EventDto)
  @ApiResponse({
    status: 200,
    description: '이벤트 조회 성공',
    type: EventDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEvent(
    @ReqWorkspace() { id }: Workspace,
    @Param('eventId') eventId: number,
  ) {
    return this.eventService.findOne(id, eventId);
  }

  @Patch(':eventId')
  @ApiOperation({
    summary: '이벤트 수정',
    description: '이벤트를 수정합니다.',
  })
  @Serialize(EventDto)
  @ApiResponse({
    status: 200,
    description: '이벤트 수정 성공',
    type: EventDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async updateEvent(
    @ReqWorkspace() { id }: Workspace,
    @Param('eventId') eventId: number,
    @Body() dto: CreateEventBodyDto,
  ) {
    return this.eventService.update(id, eventId, dto);
  }

  @Delete(':eventId')
  @ApiOperation({
    summary: '이벤트 삭제',
    description: '이벤트를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이벤트 삭제 성공',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async deleteEvent(
    @ReqWorkspace() { id }: Workspace,
    @Param('eventId') eventId: number,
  ) {
    return this.eventService.delete(id, eventId);
  }

  @Get(':eventId/history')
  @ApiOperation({
    summary: '이벤트 히스토리 조회',
    description: '이벤트 히스토리를 조회합니다.',
  })
  @ApiOkResponsePaginated(EventHistoryDto)
  @Serialize(EventHistoryDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getEventHistoryByEventId(
    @ReqWorkspace() { id }: Workspace,
    @Param('eventId') eventId: number,
    @Query() dto: FindEventHistoryQueryDto,
  ) {
    const query = {
      ...dto,
      eventId,
    } as FindEventHistoryQueryDto;

    const nodes = await this.eventService.findHistory(id, query);
    const total = await this.eventService.countHistory(id, query);

    return {
      nodes,
      total,
    };
  }
}
