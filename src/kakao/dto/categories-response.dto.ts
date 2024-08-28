import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class Category {
  @ApiProperty({
    name: '카테고리 code',
    description: '카카오 채널 카테고리 code',
  })
  code: string;

  @ApiProperty({
    name: '카테고리 이름',
    description: '카카오 채널 카테고리 이름',
  })
  @Expose({ name: 'name' })
  name: string;
}

export class CategoriesResponseDto {
  @ApiProperty({
    name: '카테고리 목록',
    description: '카카오 채널 카테고리 목록',
    type: [Category],
  })
  @Expose()
  @Type(() => Category)
  categories: Category[];
}
