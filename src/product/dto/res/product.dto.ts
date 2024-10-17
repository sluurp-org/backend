import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { EventDto } from 'src/event/dto/res/event.dto';
import { StoreDto } from 'src/store/dto/res/store.dto';

export class ProductDto {
  @ApiProperty({
    example: 1,
    description: '상품 ID',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: '커피',
    description: '상품 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'https://image.com',
    description: '상품 이미지',
  })
  @Expose()
  productImage: string;

  @ApiProperty({
    example: '1',
    description: '외부사 상품 ID',
  })
  @Expose()
  productId: string;

  @ApiProperty({
    type: [EventDto],
    description: '이벤트',
  })
  @Expose()
  @Type(() => EventDto)
  event?: EventDto[];

  @ApiProperty({
    type: StoreDto,
    description: '스토어',
  })
  @Expose()
  @Type(() => StoreDto)
  store: StoreDto;

  @Exclude()
  storeId: number;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
