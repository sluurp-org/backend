import { ApiProperty } from '@nestjs/swagger';

export class FindOrderBatchResponseDto {
  @ApiProperty({
    description: '스토어 아이디',
    example: '2',
  })
  storeId: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
  })
  productOrderId: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  orderId: string;

  @ApiProperty({
    description: '상품 존재 여부',
    example: true,
  })
  isExist: boolean;
}
