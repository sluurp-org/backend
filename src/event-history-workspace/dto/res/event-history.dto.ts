import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus, ContentType, EventStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

export class EventContentDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 그룹 ID',
    example: 1,
  })
  contentGroupId: number;

  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 텍스트',
    example: '이벤트 콘텐츠',
  })
  text?: string;

  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 타입',
    example: ContentType.FILE,
    enum: ContentType,
  })
  type: ContentType;

  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 파일 이름',
    example: '이벤트 콘텐츠',
  })
  name?: string;

  @Exclude()
  workspaceId: number;

  @Exclude()
  used: boolean;

  @Exclude()
  status: ContentStatus;

  @Exclude()
  key?: string;

  @Exclude()
  size?: number;

  @Exclude()
  mimeType?: string;

  @Exclude()
  extension?: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;
}

export class EventContentConnectionDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 횟수',
    example: 1,
  })
  downloadCount: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 제한 횟수',
    example: 1,
  })
  downloadLimit: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 제한 여부',
    example: false,
  })
  disableDownload: boolean;

  @Expose()
  @ApiProperty({
    description: '마지막 날짜',
    example: '2024-01-01',
  })
  lastDownloadAt: Date;

  @Expose()
  @ApiProperty({
    description: '첫 다운로드 날짜',
    example: '2024-01-01',
  })
  firstDownloadAt: Date;

  @Expose()
  @ApiProperty({
    description: '다운로드 만료일',
    example: '2024-01-01',
  })
  expiredAt: Date;

  @Expose()
  @ApiProperty({
    description: '이벤트 콘텐츠',
    type: EventContentDto,
  })
  @Type(() => EventContentDto)
  content: EventContentDto;

  @Exclude()
  eventHistoryId: string;

  @Exclude()
  contentId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class EventHistoryMessageDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 메시지 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '이벤트 메시지 이름',
    example: '이벤트 메시지',
  })
  name: string;

  @Exclude()
  completeDelivery: boolean;

  @Exclude()
  readonly: boolean;

  @Exclude()
  isGlobal: boolean;

  @Exclude()
  variables: PrismaJson.TemplateVariables;

  @Exclude()
  workspaceId: number;

  @Exclude()
  kakaoTemplateId: number;

  @Exclude()
  contentGroupId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class EventHistoryDto {
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
    description: '이벤트 콘텐츠 목록',
    type: [EventContentConnectionDto],
  })
  @Type(() => EventContentConnectionDto)
  contents: EventContentConnectionDto[];

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
    description: '이벤트 메시지',
    example: '상품은 잘 받으셨나요...',
  })
  messageContent: string;

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
    description: '이벤트 메시지',
    example: '2024-01-01',
  })
  @Type(() => EventHistoryMessageDto)
  eventMessage: EventHistoryMessageDto;

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
