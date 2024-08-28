import { Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContentGroupsDto } from './dto/content-groups.dto';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';
import { plainToInstance } from 'class-transformer';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';

@ApiTags('content')
@WorkspaceController('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOperation({
    summary: '컨텐츠 리스트',
    description: '워크스페이스의 컨텐츠 리스트를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '컨텐츠 리스트를 조회합니다.',
    type: ContentGroupsDto,
  })
  @Get()
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findAll(
    @ReqWorkspace() workspace: Workspace,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const products = await this.contentService.findMany(
      workspace.id,
      paginationQueryDto,
    );
    return plainToInstance(ContentGroupsDto, products, {
      excludeExtraneousValues: true,
    });
  }
}
