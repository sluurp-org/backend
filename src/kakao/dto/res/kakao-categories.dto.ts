import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { KakaoChannelCategory } from 'solapi';

export class KakaoCategories implements KakaoChannelCategory {
  @ApiProperty({
    description: '카카오 채널 카테고리 code',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: '카카오 채널 카테고리 이름',
  })
  @Expose()
  name: string;
}

export class KakaoCategoryDto {
  @ApiProperty({
    description: '카카오 채널 카테고리 리스트',
    type: [KakaoCategories],
  })
  @Expose({ name: 'categories' })
  @Type(() => KakaoCategories)
  categories: KakaoCategories[];
}
