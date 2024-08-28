import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Workspace, WorkspaceRole } from '@prisma/client';

import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { CreateStoreBodyDto } from './dto/create-store-body.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreService } from './store.service';
import { GetStoreDto } from './dto/get-store.dto';

@ApiTags('store')
@WorkspaceController('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({
    summary: '스토어 리스트',
    description: '워크스페이스의 스토어 리스트를 조회합니다.',
  })
  @Get()
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async findAll(
    @ReqWorkspace() workspace: Workspace,
    @Query() getStoreDto: GetStoreDto,
  ) {
    return this.storeService.findMany(workspace.id, getStoreDto);
  }

  @ApiOperation({
    summary: '스토어 조회',
    description: '워크스페이스의 스토어 정보를 조회합니다.',
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
  @Post(':storeId')
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async update(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(workspace.id, storeId, updateStoreDto);
  }

  @ApiOperation({
    summary: '스토어 삭제',
    description: '워크스페이스의 스토어 정보를 삭제합니다.',
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
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async sync(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
  ) {
    return this.storeService.syncProduct(workspace.id, storeId);
  }

  @ApiOperation({
    summary: '상품 옵션 동기화',
    description: '워크스페이스의 스토어의 상품 옵션을 동기화합니다.',
  })
  @Post(':storeId/product/:productId/options')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async syncOptions(
    @ReqWorkspace() workspace: Workspace,
    @Param('storeId') storeId: number,
    @Param('productId') productId: number,
  ) {
    return this.storeService.syncOption(workspace.id, storeId, productId);
  }
}
