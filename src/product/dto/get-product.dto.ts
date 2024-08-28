import { IsString, IsEnum, IsOptional } from 'class-validator';
import { StoreType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class GetProductDto extends PaginationQueryDto {
  @ApiProperty({
    description: '스토어 타입',
    example: StoreType.SMARTSTORE,
    enum: StoreType,
    required: false,
  })
  @IsEnum(StoreType)
  @IsOptional()
  storeType?: StoreType;

  @ApiProperty({
    description: '상품 이름',
    example: '스타벅스',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
