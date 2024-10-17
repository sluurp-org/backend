import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindContentQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '사용 여부',
    example: true,
    required: false,
  })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  isUsed?: boolean;
}
