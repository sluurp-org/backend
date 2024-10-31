import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { OrderModule } from 'src/order/order.module';
import { SmartstoreModule } from 'src/smartstore/smartstore.module';
import { StoreModule } from 'src/store/store.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PurchaseModule } from 'src/purchase/purchase.module';

@Module({
  imports: [
    OrderModule,
    SmartstoreModule,
    OrderModule,
    StoreModule,
    PrismaModule,
    PurchaseModule,
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
