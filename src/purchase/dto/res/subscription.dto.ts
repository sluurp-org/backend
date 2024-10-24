import { ApiProperty } from "@nestjs/swagger";
import { PurchaseStatus } from "@prisma/client";
import { Expose, Type } from "class-transformer";
import { GetSubscriptionProductsResponseDto } from "src/subscription/dto/res/subscription.dto";

export class SubscriptionResponseDto {
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

  @ApiProperty({
    type: GetSubscriptionProductsResponseDto,
    description: '구독 정보',
  })
  @Expose()
  @Type(() => GetSubscriptionProductsResponseDto)
  subscription: GetSubscriptionProductsResponseDto;
}

export class WorkspaceSubscriptionResponseDto {
  @ApiProperty({
    type: SubscriptionResponseDto,
    description: '현재 구독 정보',
  })
  @Expose()
  @Type(() => SubscriptionResponseDto)
  currentSubscription: SubscriptionResponseDto;

  @ApiProperty({
    type: SubscriptionResponseDto,
    description: '다음 구독',
    nullable: true,
  })
  @Expose()
  @Type(() => SubscriptionResponseDto)
  nextSubscription?: SubscriptionResponseDto;
}
