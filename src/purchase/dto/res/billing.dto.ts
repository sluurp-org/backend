import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class BillingDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '빌링 ID',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '1234-1234-1234-1234',
    description: '카드 번호',
  })
  cardNumber: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: '기본 결제 수단 여부',
  })
  default: boolean;

  @Expose()
  @ApiProperty({
    example: new Date(),
    description: '생성일',
  })
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  hashedCardNumber: string;

  @Exclude()
  billingKey: string;

  @Exclude()
  workspaceId: number;
}
