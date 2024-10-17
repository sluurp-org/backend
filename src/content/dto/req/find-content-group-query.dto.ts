import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindContentGroupQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '컨텐츠 그룹 이름',
    example: '테스트 컨텐츠 그룹',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '컨텐츠 그룹 타입',
    example: ContentType.TEXT,
    default: ContentType.TEXT,
    enum: ContentType,
    required: false,
  })
  @IsEnum(ContentType)
  @IsOptional()
  type?: ContentType;

  @ApiProperty({
    description: '일회성 컨텐츠 여부',
    example: true,
    required: false,
  })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  oneTime?: boolean;
}
