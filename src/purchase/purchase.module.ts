import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PortoneModule } from 'src/portone/portone.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [WorkspaceModule, PrismaModule, PortoneModule, TelegramModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
