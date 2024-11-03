import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PurchaseDto {
  @Expose()
  @ApiProperty({
    example: true,
    description: '무료 체험 가능 여부',
  })
  freeTrialAvailable: boolean;

  @Expose()
  @ApiProperty({
    example: true,
    description: '결제 여부',
  })
  noPurchase: boolean;

  @Expose()
  @ApiProperty({
    example: '2021-08-01',
    description: '다음 결제 예정일',
  })
  nextPurchaseAt: Date;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '콘텐츠 발송 횟수',
  })
  contentSendCount: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '알림톡 발송 횟수',
  })
  alimtalkSendCount: number;

  @Expose()
  @ApiProperty({
    example: 5000,
    description: '결제 금액',
  })
  amount: number;

  @Expose()
  @ApiProperty({
    example: 5000,
    description: '할인 금액',
  })
  discountAmount: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '총 결제 금액',
  })
  totalAmount: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '기본 결제 금액',
  })
  defaultPrice: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '알림톡 단가',
  })
  alimtalkSendPrice: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '콘텐츠 단가',
  })
  contentSendPrice: number;
}
