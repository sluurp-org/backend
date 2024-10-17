import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { MessageDto } from 'src/message/dto/res/message.dto';

export class EventDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 고유 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '상품 ID',
    example: 1,
  })
  productId: number;

  @Expose()
  @ApiProperty({
    description: '상품 옵션 ID',
    example: 1,
    required: false,
  })
  productVariantId?: number;

  @Expose()
  @ApiProperty({
    description: '메시지 ID',
    example: 1,
  })
  messageId: number;

  @Expose()
  @ApiProperty({
    description: '메시지',
    type: MessageDto,
  })
  @Type(() => MessageDto)
  message: MessageDto;

  @Expose()
  @ApiProperty({
    description: '이벤트 타입',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
  })
  type: OrderStatus;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
