import { ApiProperty } from '@nestjs/swagger';
import { KakaoTemplateStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { KakaoTemplateButtons } from './message.dto';

export class CustomKakaoTemplatesDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '템플릿 ID',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '템플릿 이름',
    description: '템플릿 이름',
  })
  name: string | null;

  @Expose()
  @ApiProperty({
    example: '템플릿 설명',
    description: '템플릿 설명',
  })
  description: string | null;

  @Expose()
  @ApiProperty({
    example: '템플릿 내용',
    description: '템플릿 내용',
  })
  content: string;

  @Expose()
  @ApiProperty({
    example: 'https://image.url',
    description: '이미지 URL',
  })
  imageUrl: string | null;

  @Expose()
  @ApiProperty({
    example: 'extra',
    description: '추가 정보',
  })
  extra: string | null;

  @Expose()
  @ApiProperty({
    type: KakaoTemplateButtons,
    description: '버튼 정보',
  })
  buttons: KakaoTemplateButtons | null;

  @Exclude()
  templateId: string;

  @Exclude()
  status: KakaoTemplateStatus;

  @Exclude()
  isCustomAvailable: boolean;

  @Exclude()
  categoryCode: string;

  @Exclude()
  imageId: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
