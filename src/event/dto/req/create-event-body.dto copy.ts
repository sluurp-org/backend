import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateEventBodyDto {
  @ApiProperty({
    description: '상품 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

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
    description: '이벤트 타입',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  type: OrderStatus;
}
