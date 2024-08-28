import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
