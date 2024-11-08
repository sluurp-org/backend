import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseWorkspaceController } from './purchase-workspace.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PortoneModule } from 'src/portone/portone.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { PurchaseController } from './purchase.controller';
import { KakaoModule } from 'src/kakao/kakao.module';

@Module({
  imports: [
    WorkspaceModule,
    PrismaModule,
    PortoneModule,
    TelegramModule,
    KakaoModule,
  ],
  controllers: [PurchaseWorkspaceController, PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
