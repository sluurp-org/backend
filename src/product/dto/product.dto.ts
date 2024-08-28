import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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
