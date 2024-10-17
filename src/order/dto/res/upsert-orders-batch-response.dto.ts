import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OrderDto } from './order.dto';
import { OrderStatus } from '@prisma/client';

export class UpsertOrdersResponseDto extends OrderDto {
  @ApiProperty({
    description: '이전 상태',
    example: OrderStatus.PAYED,
    nullable: true,
  })
  @Expose()
  previousStatus?: OrderStatus;

  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  @Expose()
  isSuccess: boolean;
}

export class UpsertOrdersBatchResponseDto {
  @ApiProperty({
    description: '주문 배치 수정 응답',
    type: [UpsertOrdersResponseDto],
  })
  @Expose()
  @Type(() => UpsertOrdersResponseDto)
  orders: UpsertOrdersResponseDto[];
}
