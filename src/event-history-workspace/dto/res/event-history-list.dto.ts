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
    description: '상품 다운로드 만료 날짜',
    example: '2024-01-01',
    nullable: true,
  })
  expiredAt?: Date;

  @Expose()
  @ApiProperty({
    description: '상품 다운로드 횟수',
    example: 1,
  })
  downloadCount: number;

  @Expose()
  @ApiProperty({
    description: '상품 다운로드 제한 여부',
    example: false,
  })
  disableDownload: boolean;

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
  message: string;

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

  @Exclude()
  eventId: number;

  @Exclude()
  orderId: number;

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
