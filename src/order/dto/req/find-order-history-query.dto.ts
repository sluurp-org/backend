import { ApiProperty } from '@nestjs/swagger';
import { OrderHistoryType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindOrderHistoryQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '히스토리 타입',
    example: OrderHistoryType.EVENT,
    enum: OrderHistoryType,
    required: false,
  })
  @IsEnum(OrderHistoryType)
  @IsOptional()
  type?: OrderHistoryType;
}
