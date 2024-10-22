import { Module } from '@nestjs/common';
import { EventHistoryWorkspaceService } from './event-history-workspace.service';
import { EventHistoryWorkspaceController } from './event-history-workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  providers: [EventHistoryWorkspaceService],
  controllers: [EventHistoryWorkspaceController],
})
export class EventHistoryWorkspaceModule {}
