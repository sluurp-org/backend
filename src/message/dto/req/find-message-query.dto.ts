import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindMessageQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
