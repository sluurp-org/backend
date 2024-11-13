import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  // delay Days and send Hour is optional
  @ApiProperty({
    description: '지연 일',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  delayDays?: number;

  @ApiProperty({
    description: '발송 시간',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sendHour?: number;

  @ApiProperty({
    description: '이벤트 타입',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  type: OrderStatus;
}
