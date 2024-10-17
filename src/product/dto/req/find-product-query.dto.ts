import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';
import { Transform } from 'class-transformer';

export class FindProductQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '스토어 아이디',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  storeId?: number;

  @ApiProperty({
    description: '상품 이름',
    example: '스타벅스',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
