import { Get, Body, Delete, Param, Post, Query, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Workspace, WorkspaceRole } from '@prisma/client';

import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { StoreService } from './store.service';
import { FindStoreQueryDto } from './dto/req/find-store-query.dto';
import { CreateStoreBodyDto } from './dto/req/create-store-body.dto';
import { UpdateStoreBodyDto } from './dto/req/update-store-body.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { StoreDto } from './dto/res/store.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { StoreListDto } from './dto/res/store-list.dto';

@ApiTags('store')
@WorkspaceController('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({
    summary: '스토어 리스트',
    description: '워크스페이스의 스토어 리스트를 조회합니다.',
  })
  @Get()
  @Serialize(StoreListDto, true)
  @ApiOkResponsePaginated(StoreListDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async findAll(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindStoreQueryDto,
  ) {
    const nodes = await this.storeService.findMany(id, dto);
    const total = await this.storeService.count(id, dto);

    return {
      total,
      nodes,
    };
  }

  @ApiOperation({
    summary: '스토어 조회',
    description: '워크스페이스의 스토어 정보를 조회합니다.',
  })
  @Serialize(StoreDto)
  @ApiResponse({
    status: 200,
    type: StoreDto,
    description: '스토어 정보',
  })
  @Get(':storeId')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async findOne(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
  ) {
    return this.storeService.findOne(storeId, workspace.id);
  }

  @ApiOperation({
    summary: '스토어 생성',
    description: '스토어를 생성합니다.',
  })
  @Serialize(StoreDto)
  @ApiResponse({
    status: 200,
    type: StoreDto,
    description: '생성된 스토어 정보',
  })
  @Post()
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async create(
    @ReqWorkspace() workspace: Workspace,
    @Body() createStoreBodyDto: CreateStoreBodyDto,
  ) {
    return this.storeService.create(workspace.id, createStoreBodyDto);
  }

  @ApiOperation({
    summary: '스토어 수정',
    description: '워크스페이스의 스토어 정보를 수정합니다.',
  })
  @Serialize(StoreDto)
  @ApiResponse({
    status: 200,
    type: StoreDto,
    description: '수정된 스토어 정보',
  })
  @Patch(':storeId')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async update(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
    @Body() updateStoreBodyDto: UpdateStoreBodyDto,
  ) {
    return this.storeService.update(workspace.id, storeId, updateStoreBodyDto);
  }

  @ApiOperation({
    summary: '스토어 삭제',
    description: '워크스페이스의 스토어 정보를 삭제합니다.',
  })
  @Serialize(StoreDto)
  @ApiResponse({
    status: 200,
    type: StoreDto,
    description: '삭제 성공',
  })
  @Delete(':storeId')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async remove(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
  ) {
    return this.storeService.delete(workspace.id, storeId);
  }

  @ApiOperation({
    summary: '스토어 상품 동기화',
    description: '워크스페이스의 스토어 상품 정보를 동기화합니다.',
  })
  @Post(':storeId/product')
  @Serialize(StoreDto)
  @ApiResponse({
    status: 200,
    type: StoreDto,
    description: '동기화 성공',
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async sync(
    @ReqWorkspace() { id }: Workspace,
    @Param('storeId') storeId: number,
  ) {
    return this.storeService.syncProduct(id, storeId);
  }
}
