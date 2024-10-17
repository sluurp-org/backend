import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderBatchDto {
  @ApiProperty({
    description: '스토어 아이디',
    example: '2',
  })
  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
  })
  @IsString()
  @IsNotEmpty()
  productOrderId: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class FindOrdersBatchBodyDto {
  @ApiProperty({
    description: '주문 배치 조회',
    type: [OrderBatchDto],
  })
  @Type(() => OrderBatchDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  orders: OrderBatchDto[];
}
