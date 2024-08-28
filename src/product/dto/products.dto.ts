import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductDto } from './product.dto';
import { StoreType } from '@prisma/client';

class StoreDto {
  @ApiProperty({
    description: '스토어 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '스토어 이름',
    example: '스타벅스',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '스토어 타입',
    example: StoreType.SMARTSTORE,
    enum: StoreType,
  })
  @Expose()
  type: StoreType;

  @Exclude()
  enabled: boolean;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

class NodeDto extends PickType(ProductDto, [
  'id',
  'name',
  'productImage',
  'productId',
]) {
  @ApiProperty({
    description: '스토어 정보',
    type: StoreDto,
  })
  @Type(() => StoreDto)
  @Expose({ name: 'store' })
  store: StoreDto;
}

export class ProductsDto {
  @ApiProperty({
    description: '상품 리스트',
    type: [NodeDto],
  })
  @Type(() => NodeDto)
  @Expose({ name: 'nodes' })
  nodes: NodeDto[];

  @ApiProperty({
    example: 10,
    description: '총 상품 개수',
  })
  @Expose()
  total: number;
}
