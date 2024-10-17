import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { CreateMessageBodyDto } from './dto/req/create-message-body.dto';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { MessagesDto } from './dto/res/messages.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { FindMessageQueryDto } from './dto/req/find-message-query.dto';
import { UpdateMessageBodyDto } from './dto/req/update-message-body.dto';
import { MessageDto } from './dto/res/message.dto';
import { VariablesDto } from './dto/res/variables.dto';

@ApiTags('message')
@WorkspaceController('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Get()
  @ApiOkResponsePaginated(MessagesDto)
  @Serialize(MessagesDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  @ApiOperation({
    summary: '메시지 템플릿 목록 조회',
    description: '메시지 템플릿 목록을 조회합니다.',
  })
  public async getMessages(
    @ReqWorkspace() workspace: Workspace,
    @Query() dto: FindMessageQueryDto,
  ) {
    const nodes = await this.messageService.findAll(workspace.id, dto);
    const total = await this.messageService.count(workspace.id, dto);
    return {
      nodes,
      total,
    };
  }

  @Get('variables')
  @ApiOperation({
    summary: '사용 가능한 변수 목록 조회',
    description: '사용 가능한 변수 목록을 조회합니다.',
  })
  @Serialize(VariablesDto, true)
  @ApiOkResponsePaginated(VariablesDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getVariables() {
    const nodes = await this.messageService.findAllVariables();
    const total = await this.messageService.countVariables();

    return {
      nodes,
      total,
    };
  }

  @Get(':messageId')
  @ApiOperation({
    summary: '메시지 템플릿 조회',
    description: '메시지 템플릿을 조회합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async getMessage(
    @ReqWorkspace() workspace: Workspace,
    @Param('messageId') messageId: number,
  ) {
    return this.messageService.findOne(workspace.id, messageId);
  }

  @Post()
  @ApiOperation({
    summary: '메시지 템플릿 생성',
    description: '메시지 템플릿을 생성합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async createMessage(
    @ReqWorkspace() workspace: Workspace,
    @Body() createMessageBodyDto: CreateMessageBodyDto,
  ) {
    return this.messageService.createMessage(
      workspace.id,
      createMessageBodyDto,
    );
  }

  @Patch(':messageId')
  @ApiOperation({
    summary: '메시지 템플릿 수정',
    description: '메시지 템플릿을 수정합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async updateMessage(
    @ReqWorkspace() workspace: Workspace,
    @Param('messageId') messageId: number,
    @Body() updateMessageBodyDto: UpdateMessageBodyDto,
  ) {
    return this.messageService.updateMessage(
      workspace.id,
      messageId,
      updateMessageBodyDto,
    );
  }
  @Delete(':messageId')
  @ApiOperation({
    summary: '메시지 템플릿 삭제',
    description: '메시지 템플릿을 삭제합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async deleteMessage(
    @ReqWorkspace() workspace: Workspace,
    @Param('messageId') messageId: number,
  ) {
    return this.messageService.deleteMessage(workspace.id, messageId);
  }

  @Post(':messageId/inspection')
  @ApiOperation({
    summary: '카카오 메시지 템플릿 검수 요청 ',
    description: '카카오 메시지 템플릿을 검수 요청 합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async requestKakaoTemplateInspection(
    @ReqWorkspace() workspace: Workspace,
    @Param('messageId') messageId: number,
  ) {
    return this.messageService.requestMessageInspection(
      workspace.id,
      messageId,
    );
  }

  @Delete(':messageId/inspection')
  @ApiOperation({
    summary: '카카오 메시지 템플릿 검수 취소',
    description: '카카오 메시지 템플릿 검수를 취소합니다.',
  })
  @Serialize(MessageDto)
  @ApiResponse({
    status: 200,
    description: '메시지 템플릿 조회 성공',
    type: MessageDto,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async cancelMessageInspection(
    @ReqWorkspace() workspace: Workspace,
    @Param('messageId') messageId: number,
  ) {
    return this.messageService.cancelMessageInspection(workspace.id, messageId);
  }
}
