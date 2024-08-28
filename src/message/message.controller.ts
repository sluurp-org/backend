import { Body, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('message')
@WorkspaceController('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  public async createMessage(
    @ReqWorkspace() workspace: Workspace,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(workspace.id, createMessageDto);
  }
}
