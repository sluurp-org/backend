import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { SubscriptionModel, Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { ContentGroupDto } from './dto/res/content-group.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CreateContentGroupBodyDto } from './dto/req/create-content-group-body.dto';
import { UpdateContentGroupBodyDto } from './dto/req/update-content-group-body.dto';
import { FindContentGroupQueryDto } from './dto/req/find-content-group-query.dto';
import { ContentDto } from './dto/res/content.dto';
import { FindContentQueryDto } from './dto/req/find-content-query.dto copy';
import { CreateContentBodyDto } from './dto/req/create-content-body.dto';
import { UpdateContentBodyDto } from './dto/req/update-content-body.dto.ts';
import { CreateContentFileBodyDto } from './dto/req/create-content-file-body.dto';
import { ReqSubscription } from 'src/common/decorators/req-subscription.decorator';

@ApiTags('content')
@WorkspaceController('content-group')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOperation({
    summary: '컨텐츠 그룹 리스트',
    description: '워크스페이스의 컨텐츠 리스트를 조회합니다.',
  })
  @Get()
  @Serialize(ContentGroupDto, true)
  @ApiOkResponsePaginated(ContentGroupDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findAllGroup(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindContentGroupQueryDto,
  ) {
    const nodes = await this.contentService.findAllGroup(id, dto);
    const total = await this.contentService.countGroup(id, dto);

    return { nodes, total };
  }

  @ApiOperation({
    summary: '컨텐츠 그룹 상세 조회',
    description: '워크스페이스의 컨텐츠 그룹을 조회합니다.',
  })
  @Get(':contentGroupId')
  @Serialize(ContentGroupDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findOneGroup(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
  ) {
    return this.contentService.findOneGroup(id, contentGroupId);
  }

  @ApiOperation({
    summary: '컨텐츠 그룹 생성',
    description: '워크스페이스의 컨텐츠 그룹을 생성합니다.',
  })
  @Post()
  @Serialize(ContentGroupDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async createGroup(
    @ReqWorkspace() { id }: Workspace,
    @Body() dto: CreateContentGroupBodyDto,
    @ReqSubscription() workspaceSubscription?: SubscriptionModel,
  ) {
    return this.contentService.createGroup(id, dto, workspaceSubscription);
  }

  @ApiOperation({
    summary: '컨텐츠 그룹 수정',
    description: '워크스페이스의 컨텐츠 그룹을 수정합니다.',
  })
  @Patch(':contentGroupId')
  @Serialize(ContentGroupDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async updateGroup(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Body() data: UpdateContentGroupBodyDto,
  ) {
    return this.contentService.updateGroup(id, contentGroupId, data);
  }

  @ApiOperation({
    summary: '컨텐츠 그룹 삭제',
    description: '워크스페이스의 컨텐츠 그룹을 삭제합니다.',
  })
  @Delete(':contentGroupId')
  @Serialize(ContentGroupDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async deleteGroup(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
  ) {
    return this.contentService.deleteGroup(id, contentGroupId);
  }

  @ApiOperation({
    summary: '컨텐츠 조회',
    description: '워크스페이스의 컨텐츠를 조회합니다.',
  })
  @Get(':contentGroupId/content')
  @Serialize(ContentDto, true)
  @ApiOkResponsePaginated(ContentDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findAllContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Query() dto: FindContentQueryDto,
  ) {
    const nodes = await this.contentService.findAllContent(
      id,
      contentGroupId,
      dto,
    );
    const total = await this.contentService.countContent(
      id,
      contentGroupId,
      dto,
    );

    return { nodes, total };
  }

  @ApiOperation({
    summary: '컨텐츠 생성',
    description: '워크스페이스의 컨텐츠를 생성합니다.',
  })
  @Post(':contentGroupId/content')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async createContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Body() dto: CreateContentBodyDto,
  ) {
    return this.contentService.createContent(id, contentGroupId, dto);
  }

  @ApiOperation({
    summary: '컨텐츠 생성',
    description: '워크스페이스의 파일 컨텐츠를 생성합니다.',
  })
  @Post(':contentGroupId/content-file')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async createFileContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Body() dto: CreateContentFileBodyDto,
  ) {
    return this.contentService.createContentFile(id, contentGroupId, dto);
  }

  @ApiOperation({
    summary: '컨텐츠 수정',
    description: '워크스페이스의 컨텐츠를 수정합니다.',
  })
  @Patch(':contentGroupId/content/:contentId')
  @Serialize(ContentDto)
  @ApiResponse({
    status: 200,
    description: '컨텐츠 삭제 성공',
    type: ContentDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async updateContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Param('contentId') contentId: number,
    @Body() dto: UpdateContentBodyDto,
  ) {
    return this.contentService.updateContent(
      id,
      contentGroupId,
      contentId,
      dto,
    );
  }

  @ApiOperation({
    summary: '컨텐츠 다운로드',
    description: '워크스페이스의 컨텐츠를 다운로드합니다.',
  })
  @Get(':contentGroupId/content/:contentId/download')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async downloadContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Param('contentId') contentId: number,
  ) {
    const url = await this.contentService.downloadContent(
      id,
      contentGroupId,
      contentId,
    );
    return {
      url,
    };
  }

  @ApiOperation({
    summary: '컨텐츠 삭제',
    description: '워크스페이스의 컨텐츠를 삭제합니다.',
  })
  @Delete(':contentGroupId/content/:contentId')
  @Serialize(ContentDto)
  @ApiResponse({
    status: 200,
    description: '컨텐츠 삭제 성공',
    type: ContentDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async deleteContent(
    @ReqWorkspace() { id }: Workspace,
    @Param('contentGroupId') contentGroupId: number,
    @Param('contentId') contentId: number,
  ) {
    return this.contentService.deleteContent(id, contentGroupId, contentId);
  }
}
