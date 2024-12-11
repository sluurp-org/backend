import { ApiProperty } from '@nestjs/swagger';
import { DateTarget, DelayType, OrderStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateEventBodyDto {
  @ApiProperty({
    description: '상품 ID',
    example: 1,
  })
  @IsNumber()
  @ValidateIf((dto) => dto.productVariantId)
  @IsNotEmpty()
  productId?: number;

  @ApiProperty({
    description: '상품 옵션 ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  productVariantId?: number;

  @ApiProperty({
    description: '메시지 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  messageId: number;

  @ApiProperty({
    description: '발송 시간 기준',
    enum: DateTarget,
    default: DateTarget.ORDER,
  })
  @IsEnum(DateTarget)
  @IsOptional()
  dateType: DateTarget;

  @ApiProperty({
    description: '발송 시간 유형',
    enum: DelayType,
    default: DelayType.FUTURE,
  })
  @IsEnum(DelayType)
  @IsOptional()
  delayType: DelayType;

  @ApiProperty({
    description: '지연 일',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  delayDays?: number;

  @ApiProperty({
    description: '지연 시간',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  delayHours?: number;

  @ApiProperty({
    description: '발송 시간',
    example: 1,
    required: false,
  })
  @Min(0)
  @Max(23)
  @IsNumber()
  @IsOptional()
  fixedHour?: number;

  @ApiProperty({
    description: '이벤트 타입',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  type: OrderStatus;

  @ApiProperty({
    description: '배송완료 처리',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  confirmDelivery: boolean;
}
