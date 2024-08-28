import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { StoreType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';
import { Transform } from 'class-transformer';

export class GetStoreDto extends PaginationQueryDto {
  @ApiProperty({
    description: '스토어 타입',
    example: StoreType.SMARTSTORE,
    enum: StoreType,
    required: false,
  })
  @IsEnum(StoreType)
  @IsOptional()
  type?: StoreType;

  @ApiProperty({
    description: '활성화 여부',
    required: false,
  })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({
    description: '스토어 이름',
    example: '스타벅스',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
