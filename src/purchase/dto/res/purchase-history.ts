import { ApiProperty } from "@nestjs/swagger";
import { PurchaseStatus, PurchaseType } from "@prisma/client";
import { Exclude, Expose, Type } from "class-transformer";
import { GetSubscriptionProductsResponseDto } from "src/subscription/dto/res/subscription.dto";

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
    example: '결제 사유',
    description: '결제 사유',
  })
  reason: string;

  @Expose()
  @ApiProperty({
    example: PurchaseType.CREDIT,
    description: '결제 유형',
  })
  type: PurchaseType;

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
    example: new Date(),
    description: '구독 시작일',
  })
  @Expose()
  startedAt: Date;

  @ApiProperty({
    example: new Date(),
    description: '구독 종료일',
  })
  @Expose()
  endedAt: Date;

  @ApiProperty({
    example: PurchaseStatus.PAID,
    description: '구독 상태',
  })
  @Expose()
  status: PurchaseStatus;

  @ApiProperty({
    example: new Date(),
    description: '구독 결제일',
  })
  @Expose()
  purchasedAt: Date;
}
