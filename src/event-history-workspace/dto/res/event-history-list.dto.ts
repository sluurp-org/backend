import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class EventHistoryListDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 기록 ID',
    example: '1',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '상품 다운로드 상태',
    example: EventStatus.FAILED,
    enum: EventStatus,
  })
  status: EventStatus;

  @Expose()
  @ApiProperty({
    description: '이벤트 메시지',
    example: '이벤트 발송 대기',
  })
  rawMessage: string;

  @Expose()
  @ApiProperty({
    description: '이벤트 메시지',
    example: '상품은 잘 받으셨나요...',
  })
  messageContent: string;

  @Expose()
  @ApiProperty({
    description: '이벤트 메시지 변수',
    example: { name: '홍길동' },
  })
  messageVariables: Record<string, string>;

  @Expose()
  @ApiProperty({
    description: '이벤트 처리 날짜',
    example: '2024-01-01',
  })
  processedAt: Date;

  @Expose()
  @ApiProperty({
    description: '이벤트 기록 생성 날짜',
    example: '2024-01-01',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: '발송 예정 날짜',
    example: '2024-01-01',
  })
  scheduledAt?: Date;

  @Expose()
  @ApiProperty({
    description: '주문 ID',
    example: 1,
  })
  orderId: number;

  @Exclude()
  eventId: number;

  @Exclude()
  orderHistoryId: number;

  @Exclude()
  contentId: number;

  @Exclude()
  creditId: number;

  @Exclude()
  solapiStatusCode: string;

  @Exclude()
  solapiMessageId: string;

  @Exclude()
  updatedAt: Date;
}
