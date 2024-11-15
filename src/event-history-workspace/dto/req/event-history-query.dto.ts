import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class EventHistoryWorkspaceQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '이벤트 아이디',
    example: 'awef',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: '주문 번호',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  orderId?: number;

  @ApiProperty({
    description: '이벤트 상태',
    example: EventStatus.CONTENT_READY,
    required: false,
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({
    description: '메세지 아이디',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  messageId?: number;

  @ApiProperty({
    description: '상품 아이디',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  productId?: number;
}
