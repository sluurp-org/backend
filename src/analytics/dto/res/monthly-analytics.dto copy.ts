import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class MonthlyAnalyticsDto {
  @Expose()
  @ApiProperty({
    description: '날짜',
    example: '2021-01-01',
  })
  orderMonth: Date;

  @Expose()
  @ApiProperty({
    description: '총 주문 수',
    example: 0,
  })
  totalOrders: number;

  @Expose()
  @ApiProperty({
    description: '총 주문 수량',
    example: 0,
  })
  totalQuantity: number;

  @Expose()
  @ApiProperty({
    description: '총 매출',
    example: 0,
  })
  totalSales: number;

  @Expose()
  @ApiProperty({
    description: '총 환불',
    example: 0,
  })
  totalRefund: number;

  @Expose()
  @ApiProperty({
    description: '총 취소',
    example: 0,
  })
  totalCancelled: number;

  @Exclude()
  id: number;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;
}
