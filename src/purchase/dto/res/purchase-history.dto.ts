import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class PurchaseHistoryDto {
  @ApiProperty({
    example: '1',
    description: '결제 아이디',
  })
  @Expose()
  id: string;

  @Exclude()
  workspaceId: number;

  @Expose()
  @ApiProperty({
    example: 10000,
    description: '결제 금액',
  })
  amount: number;

  @Expose()
  @ApiProperty({
    example: 10000,
    description: '할인 금액',
  })
  discountAmount: number;

  @Expose()
  @ApiProperty({
    example: 10000,
    description: '총 결제 금액',
  })
  totalAmount: number;

  @Expose()
  @ApiProperty({
    example: '결제 사유',
    description: '결제 사유',
  })
  reason: string;

  @Exclude()
  billingId: number;

  @Exclude()
  creditId: number;

  @Exclude()
  subscriptionId: number;

  @Exclude()
  scheduledId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @ApiProperty({
    example: PurchaseStatus.PAID,
    description: '결제 상태',
  })
  @Expose()
  status: PurchaseStatus;

  @ApiProperty({
    example: new Date(),
    description: '결제일',
  })
  @Expose()
  purchasedAt: Date;
}
