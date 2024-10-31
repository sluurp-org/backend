import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { MessageModule } from 'src/message/message.module';
import { ContentModule } from 'src/content/content.module';

@Module({
  imports: [PrismaModule, WorkspaceModule, MessageModule, ContentModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
