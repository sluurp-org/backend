import { ApiProperty } from '@nestjs/swagger';
import { ContentType, EventStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

class UserEventHistoryOrderDto {
  @Expose()
  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  productOrderId: string;

  @Expose()
  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  orderId: string;

  @Expose()
  @ApiProperty({
    description: '주문자명',
    example: '홍길동',
  })
  ordererName: string;

  @Expose()
  @ApiProperty({
    description: '상품 이름',
    example: '상품 이름',
  })
  productName: string;

  @Expose()
  @ApiProperty({
    description: '상품 옵션 이름',
    example: '상품 옵션 이름',
    nullable: true,
  })
  productVariantName?: string;

  @Expose()
  @ApiProperty({
    description: '상품 가격',
    example: 10000,
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: '주문 수량',
    example: 1,
  })
  quantity: number;

  @Expose()
  @ApiProperty({
    description: '주문 일시',
    example: '2024-01-01',
  })
  orderAt: Date;
}
class UserEventHistoryContentDto {
  @Expose()
  @ApiProperty({
    description: '콘텐츠 ID',
    example: '1',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 이름',
    example: '콘텐츠 이름',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 타입',
    example: 'IMAGE',
  })
  type: ContentType;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 URL',
    example: 'https://example.com/image.jpg',
  })
  url: string;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 다운로드 URL',
    example: 'https://example.com/image.jpg',
  })
  downloadUrl: string;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 만료 일시',
    example: '2024-01-01',
  })
  expiredAt: Date;

  @Expose()
  @ApiProperty({
    description: '다운로드 횟수',
    example: 0,
  })
  downloadCount: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 제한 횟수',
    example: 0,
  })
  downloadLimit: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 고유 아이디',
    example: 1,
  })
  connectionId: number;

  @Expose()
  @ApiProperty({
    description: '다운로드 불가 안내 메시지',
    example: '다운로드 불가 안내 메시지',
  })
  error: string;

  @Expose()
  @ApiProperty({
    description: '다운로드 가능 여부',
    example: true,
  })
  downloadAvailable: boolean;
}

export class UserEventHistoryDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 기록 ID',
    example: '1',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '주문',
    type: UserEventHistoryOrderDto,
  })
  @Type(() => UserEventHistoryOrderDto)
  order: UserEventHistoryOrderDto;

  @Expose()
  @ApiProperty({
    description: '콘텐츠 목록',
    type: UserEventHistoryContentDto,
  })
  @Type(() => UserEventHistoryContentDto)
  contents: UserEventHistoryContentDto[];

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
