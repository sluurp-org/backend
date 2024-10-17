import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FindOrdersBatchResponseDto {
  @ApiProperty({
    description: '스토어 아이디',
    example: '2',
  })
  @Expose()
  storeId: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
  })
  @Expose()
  productOrderId: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: '상품 존재 여부',
    example: true,
  })
  @Expose()
  isExist: boolean;
}
