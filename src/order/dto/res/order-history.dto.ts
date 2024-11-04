import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, OrderHistoryType, OrderStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

export class EventHistoryMessageDto {
  @Expose()
  @ApiProperty({
    description: '메시지 아이디',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '메시지 명',
    example: '테스트 발송 101.',
  })
  name: string;
}

export class EventHistoryDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 기록 고유 ID',
    example: '1',
  })
  id: string;

  @Exclude()
  eventId: number;

  @Exclude()
  orderId: number;

  @Expose()
  @ApiProperty({
    description: '이벤트 상태',
    enum: EventStatus,
  })
  status: EventStatus;

  @Expose()
  @ApiProperty({
    description: '메시지',
    example: '주문이 생성되었습니다.',
  })
  message: string;

  @Expose()
  @ApiProperty({
    description: '메시지 아이디',
    example: 1,
  })
  messageId: number;

  @Expose()
  @ApiProperty({
    description: '메시지',
    type: EventHistoryMessageDto,
  })
  @Type(() => EventHistoryMessageDto)
  messageTemplate: EventHistoryMessageDto;

  @Exclude()
  solapiStatusCode: string;

  @Exclude()
  solapiMessageId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class OrderHistoryDto {
  @Expose()
  @ApiProperty({
    description: '주문 이력 고유 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '주문 상태',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
    nullable: true,
  })
  changedStatus?: OrderStatus;

  @Expose()
  @ApiProperty({
    description: '메시지',
    example: '주문 생성됨',
    nullable: true,
  })
  message?: string;

  @Expose()
  @ApiProperty({
    description: '이벤트 유형 ',
    enum: OrderHistoryType,
  })
  type: OrderHistoryType;

  @Expose()
  @ApiProperty({
    description: '생성일',
    example: '2021-07-01T00:00:00',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: '이벤트 이력',
    type: EventHistoryDto,
  })
  @Type(() => EventHistoryDto)
  eventHistory: EventHistoryDto;

  @Exclude()
  eventId: number;

  @Exclude()
  orderId: number;

  @Exclude()
  storeId: number;

  @Exclude()
  workspaceId: number;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
