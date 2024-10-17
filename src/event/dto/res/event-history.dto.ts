import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { EventDto } from './event.dto';
import { OrderDto } from 'src/order/dto/res/order.dto';
import { ContentDto } from 'src/content/dto/res/content.dto';

export class EventHistoryDto {
  @Expose()
  @ApiProperty({
    description: '이벤트 고유 uuid',
    example: '1',
  })
  id: string;

  @Exclude()
  eventId: number;

  @Expose()
  @ApiProperty({
    description: '이벤트',
    type: EventDto,
  })
  @Type(() => EventDto)
  event: EventDto;

  @Exclude()
  orderId: number;

  @Expose()
  @ApiProperty({
    description: '주문',
    type: OrderDto,
  })
  @Type(() => OrderDto)
  order: OrderDto;

  @Exclude()
  contentId: number;

  @Expose()
  @ApiProperty({
    description: '컨텐츠',
    type: ContentDto,
  })
  @Type(() => ContentDto)
  content: ContentDto;

  @Expose()
  @ApiProperty({
    description: '만료일',
    example: '2021-01-01T00:00:00',
  })
  expiredAt: Date;

  @Expose()
  @ApiProperty({
    description: '다운로드 횟수',
    example: 1,
  })
  downloadCount: number;

  @Expose()
  @ApiProperty({
    description: '이벤트 상태',
    example: EventStatus.SUCCESS,
    enum: EventStatus,
  })
  status: EventStatus;

  @Expose()
  message: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
