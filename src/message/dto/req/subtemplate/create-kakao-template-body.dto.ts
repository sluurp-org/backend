import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsVariableConstraint } from 'src/common/validator/variable.validator';

export enum KakaoTemplateButtonType {
  AC = 'AC', // Channel Add
  WL = 'WL', // Web Link
  DS = 'DS', //
  BK = 'BK',
  MD = 'MD',
  BC = 'BC',
  BT = 'BT',
  PR = 'PR', // 디지털 상품 다운로드
  RW = 'RW', // 리뷰 작성
  PC = 'PC', // 카카오톡 채널 추가
}

export class KakaoTemplateButton {
  @ApiProperty({
    description: '버튼 이름',
    example: '상세보기',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '버튼 종류',
    example: KakaoTemplateButtonType.WL,
    enum: KakaoTemplateButtonType,
  })
  @IsEnum(KakaoTemplateButtonType)
  @IsNotEmpty()
  type: KakaoTemplateButtonType;

  @ApiProperty({
    description: '버튼 링크',
    example: 'https://www.example.com',
  })
  @ValidateIf((o) => o.type === KakaoTemplateButtonType.WL)
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateKakaoTemplateBodyDto {
  @ApiProperty({
    description: '카카오 알림톡 카테고리 코드',
    example: '006003',
  })
  @IsString()
  @IsNotEmpty()
  categoryCode: string;

  @ApiProperty({
    description: '템플릿 내용',
    example: '상품을 구매해주셔서 감사합니다. #{고객명}',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '템플릿 버튼 목록',
    type: [KakaoTemplateButton],
    required: false,
  })
  @Type(() => KakaoTemplateButton)
  @ValidateNested({ each: true })
  @IsOptional()
  buttons?: KakaoTemplateButton[];

  @ApiProperty({
    description: '템플릿 이미지 id',
    example: '123456',
  })
  @IsOptional()
  imageId?: string;

  @ApiProperty({
    description: '템플릿 이미지 url (IMAGE)',
    example: 'https://www.example.com/image.jpg',
  })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: '템플릿 부가정보',
    example: '주문 정보',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Validate(IsVariableConstraint)
  extra?: string;
}
