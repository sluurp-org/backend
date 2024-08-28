import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export enum KakaoButtonType {
  WL = 'WL',
  AC = 'AC',
  DS = 'DS',
  BK = 'BK',
  MD = 'MD',
  BC = 'BC',
  BT = 'BT',
  PR = 'PR', // PRODUCT
}

enum TemplateHighlightType {
  NONE = 'NONE',
  TEXT = 'TEXT',
  ITEM_LIST = 'ITEM_LIST',
}

class KakaoListItemContent {
  @ApiProperty({
    description: '리스트 아이템 제목',
    example: '아메리카노',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '리스트 아이템 설명',
    example: '아메리카노 1잔',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

class KakaoListItem {
  @ApiProperty({
    description: '리스트 아이템 내용',
    type: [KakaoListItemContent],
  })
  @Type(() => KakaoListItemContent)
  @IsNotEmpty()
  @Max(10)
  @Min(2)
  list: KakaoListItemContent[];
}

class KakaoTemplateButton {
  @ApiProperty({
    description: '버튼 이름',
    example: '상세보기',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '버튼 종류',
    example: KakaoButtonType.WL,
    enum: KakaoButtonType,
  })
  @IsEnum(KakaoButtonType)
  @IsNotEmpty()
  type: KakaoButtonType;

  @ApiProperty({
    description: '버튼 링크',
    example: 'https://www.example.com',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}

class KakaoHighlight {
  @ApiProperty({
    description: '템플릿 하이라이트 제목 (TEXT)',
    example: '주문 완료',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '템플릿 하이라이트 부제목 (TEXT)',
    example: '주문이 완료되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateKakaoTemplateDto {
  @ApiProperty({
    description: '카카오 알림톡 카테고리 코드',
    example: 'CTGR_001',
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
  @IsOptional()
  @Max(5)
  buttons?: KakaoTemplateButton[];

  @ApiProperty({
    description: '바로 연결',
    type: [KakaoTemplateButton],
    required: false,
  })
  @Type(() => KakaoTemplateButton)
  @IsOptional()
  @Max(10)
  quickReplies?: KakaoTemplateButton[];

  @ApiProperty({
    description: '템플릿 하이라이트 타입',
    example: TemplateHighlightType.TEXT,
    enum: TemplateHighlightType,
  })
  @IsEnum(TemplateHighlightType)
  @IsNotEmpty()
  emphasizeType: TemplateHighlightType;

  @ApiProperty({
    description: '템플릿 강조표기형 제목 (TEXT)',
    example: '주문 완료',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.emphasizeType === TemplateHighlightType.TEXT)
  emphasizeTitle: string;

  @ApiProperty({
    description: '템플릿 강조표기형 부제목 (TEXT)',
    example: '주문이 완료되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.emphasizeType === TemplateHighlightType.TEXT)
  emphasizeSubTitle: string;

  @ApiProperty({
    description: '템플릿 헤더 (ITEM_LIST)',
    example: '주문 내역',
    required: false,
  })
  @Type(() => KakaoHighlight)
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.emphasizeType === TemplateHighlightType.ITEM_LIST)
  header?: string;

  @ApiProperty({
    description: '템플릿 하이라이트 (ITEM_LIST)',
    type: KakaoHighlight,
    required: false,
  })
  @Type(() => KakaoHighlight)
  @IsOptional()
  @ValidateIf((o) => o.emphasizeType === TemplateHighlightType.ITEM_LIST)
  highlight?: KakaoHighlight;

  @ApiProperty({
    description: '템플릿 리스트 아이템 (ITEM_LIST)',
    type: KakaoListItem,
    required: false,
  })
  @Type(() => KakaoListItem)
  @IsOptional()
  @ValidateIf((o) => o.emphasizeType === TemplateHighlightType.ITEM_LIST)
  itemList?: KakaoListItem;

  @ApiProperty({
    description: '템플릿 부가정보',
    example: '주문 정보',
    required: false,
  })
  @IsString()
  @IsOptional()
  extra?: string;

  @ApiProperty({
    description: '보안 템플릿 여부',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  securityFlag: boolean;
}
