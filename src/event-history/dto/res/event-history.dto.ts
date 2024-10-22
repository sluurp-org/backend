import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEventHistoryDto {
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
    description: '상품 다운로드 가능 여부',
    example: false,
  })
  downloadAvailable: boolean;

  @Expose()
  @ApiProperty({
    description: '상품 다운로드 에러 메시지',
    example: '다운로드 에러',
    nullable: true,
  })
  downloadError?: string;

  @Exclude()
  disableDownload: boolean;

  @Exclude()
  processedAt: Date;

  @Exclude()
  status: EventStatus;

  @Exclude()
  message: string;

  @Exclude()
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
