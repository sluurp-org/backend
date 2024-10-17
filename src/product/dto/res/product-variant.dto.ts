import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { EventDto } from 'src/event/dto/res/event.dto';

export class ProductVariantDto {
  @ApiProperty({
    example: 1,
    description: '상품 옵션 ID',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: '커피',
    description: '상품 옵션 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: '1',
    description: '상품 옵션 ID',
  })
  variantId: string;

  @ApiProperty({
    type: [EventDto],
    description: '이벤트',
  })
  @Expose()
  @Type(() => EventDto)
  event?: EventDto[];

  @Exclude()
  productId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
