import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { OrderModule } from 'src/order/order.module';
import { NcommerceModule } from 'src/ncommerce/ncommerce.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [OrderModule, NcommerceModule, OrderModule, StoreModule],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
