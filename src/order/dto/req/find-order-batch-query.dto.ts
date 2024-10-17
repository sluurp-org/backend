import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class FindOrderBatchQueryDto {
  @ApiProperty({
    description: '주문 상태',
    example: OrderStatus.CANCEL,
    enum: OrderStatus,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    description: '스토어 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  storeId?: number;
}
