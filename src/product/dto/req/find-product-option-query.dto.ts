import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindProductOptionQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '상품 이름',
    example: '스타벅스',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
