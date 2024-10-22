import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class EventHistoryWorkspaceQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '주문 번호',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  orderId?: number;
}
