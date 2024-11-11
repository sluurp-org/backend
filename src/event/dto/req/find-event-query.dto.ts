import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindEventQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '이벤트 ID',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: '상품 ID',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '') return null;
    return parseInt(value);
  })
  @ValidateIf((o) => o.productId)
  @IsNumber()
  productId?: number | null;

  @ApiProperty({
    description: '상품 옵션 ID',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '') return null;
    return parseInt(value);
  })
  @ValidateIf((o) => o.productVariantId)
  @IsNumber()
  productVariantId?: number | null;

  @ApiProperty({
    description: '메시지 ID',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  messageId?: number;
}
