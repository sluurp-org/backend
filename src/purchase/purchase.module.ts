import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CreditModule } from 'src/credit/credit.module';
import { PortoneModule } from 'src/portone/portone.module';

@Module({
  imports: [WorkspaceModule, PrismaModule, CreditModule, PortoneModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
