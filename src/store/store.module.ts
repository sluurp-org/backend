import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { SmartstoreModule } from 'src/smartstore/smartstore.module';
import { StoreCommand } from './store.command';
import { KakaoModule } from 'src/kakao/kakao.module';
import { SmartplaceModule } from 'src/smartplace/smartplace.module';

@Module({
  imports: [
    PrismaModule,
    WorkspaceModule,
    SmartstoreModule,
    SmartplaceModule,
    KakaoModule,
  ],
  controllers: [StoreController],
  providers: [StoreService, StoreCommand],
  exports: [StoreService],
})
export class StoreModule {}
