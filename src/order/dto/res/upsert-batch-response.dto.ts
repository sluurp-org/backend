import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderDto } from './order.dto';

export class FindOrderUpdateBatchResponseDto {
  @ApiProperty({
    description: '주문 배치 조회',
    type: [OrderDto],
  })
  @Type(() => OrderDto)
  orders: OrderDto[];
}
