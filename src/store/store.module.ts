import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { SmartstoreModule } from 'src/smartstore/smartstore.module';
import { StoreCommand } from './store.command';

@Module({
  imports: [PrismaModule, WorkspaceModule, SmartstoreModule],
  controllers: [StoreController],
  providers: [StoreService, StoreCommand],
  exports: [StoreService],
})
export class StoreModule {}
