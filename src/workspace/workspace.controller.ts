import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@ApiTags('workspace')
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: '내 워크스페이스 조회',
    description: '내 워크스페이스를 조회합니다.',
  })
  async getWorkspaces(@ReqUser() user: User) {
    return this.workspaceService.findWorkspacesByUserId(user.id);
  }

  @Get(':workspaceId')
  @Auth()
  @ApiOperation({
    summary: '워크스페이스 조회',
    description: '워크스페이스를 조회합니다.',
  })
  async getWorkspace(@ReqUser() user: User, @Param('workspaceId') id: number) {
    return this.workspaceService.findWorkspaceById(user.id, id);
  }

  @Post()
  @Auth()
  @ApiOperation({
    summary: '워크스페이스 생성',
    description: '워크스페이스를 생성합니다.',
  })
  async createWorkspace(
    @ReqUser() user: User,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.createWorkspace(user.id, createWorkspaceDto);
  }

  @Patch(':workspaceId')
  @Auth()
  @ApiOperation({
    summary: '워크스페이스 수정',
    description: '워크스페이스를 수정합니다.',
  })
  async updateWorkspace(
    @Param('workspaceId') id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.updateWorkspace(id, updateWorkspaceDto);
  }

  @Auth()
  @Delete(':workspaceId')
  @ApiOperation({
    summary: '워크스페이스 삭제',
    description: '워크스페이스를 삭제합니다.',
  })
  async deleteWorkspace(
    @ReqUser() user: User,
    @Param('workspaceId') id: number,
  ) {
    return this.workspaceService.deleteWorkspace(user.id, id);
  }
}
