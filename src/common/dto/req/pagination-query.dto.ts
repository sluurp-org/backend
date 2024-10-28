import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    description: '한 페이지에 보여질 데이터의 개수',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  size: number;

  @ApiProperty({
    description: '데이터를 가져올 시작 위치',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number;

  get take(): number {
    return this.size || 1000;
  }

  get skip(): number {
    return (this.page - 1) * this.size || 0;
  }
}
