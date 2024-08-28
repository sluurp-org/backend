import { Injectable } from '@nestjs/common';
import { GetTokenQueryDto } from 'src/ncommerce/dto/get-token-query.dto';
import { NcommerceService } from 'src/ncommerce/ncommerce.service';
import { FindOrdersDto } from 'src/order/dto/req/find-batch.dto';
import { FindOrderQueryDto } from 'src/order/dto/req/find-order-query.dto';
import { UpdateOrdersDto } from 'src/order/dto/req/upsert-batch.dto';
import { OrderService } from 'src/order/order.service';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class WorkerService {
  constructor(
    private readonly orderService: OrderService,
    private readonly ncommerceService: NcommerceService,
    private readonly storeService: StoreService,
  ) {}

  public async getOrders(dto: FindOrderQueryDto) {
    return await this.orderService.findOrdersByFilter(dto);
  }

  public async findOrders(batchDto: FindOrdersDto) {
    return await this.orderService.findOrders(batchDto);
  }

  public async updateOrders(batchDto: UpdateOrdersDto) {
    return await this.orderService.updateOrders(batchDto);
  }

  public async getNcommerceToken(dto: GetTokenQueryDto) {
    const { applicationId, applicationSecret } = dto;

    return await this.ncommerceService.getAccessToken(
      applicationId,
      applicationSecret,
    );
  }

  public async updateStoreLastSyncedAt(storeId: number, lastSyncedAt: Date) {
    return this.storeService.updateStoreLastSyncedAt(storeId, lastSyncedAt);
  }
}
