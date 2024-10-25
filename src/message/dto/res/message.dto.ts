import { ApiProperty } from '@nestjs/swagger';
import { ContentType, KakaoTemplateStatus } from '@prisma/client';
import { Expose, Exclude, Type } from 'class-transformer';
import { KakaoTemplateButtonType } from '../req/subtemplate/create-kakao-template-body.dto';

export class MessageVariablesDto {
  @Expose()
  @ApiProperty({
    description: '변수명',
    example: 'name',
  })
  key: string;

  @Expose()
  @ApiProperty({
    description: '값',
    example: 'value',
  })
  value: string;
}

export class MessageContentGroupDto {
  @Expose()
  @ApiProperty({
    description: '컨텐츠 그룹 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '컨텐츠 그룹 이름',
    example: '컨텐츠 그룹',
  })
  name: string;

  @Exclude()
  type: ContentType;

  @Exclude()
  oneTime: boolean;

  @Exclude()
  expireMinute: number;

  @Exclude()
  downloadLimit: number;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

export class KakaoTemplateButtons {
  @Expose()
  @ApiProperty({
    description: '버튼명',
    example: '버튼',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: '버튼 타입',
    enum: KakaoTemplateButtonType,
    example: KakaoTemplateButtonType.AC,
  })
  type: KakaoTemplateButtonType;

  @Expose()
  @ApiProperty({
    description: '버튼 URL',
    example: 'https://www.example.com',
    required: false,
  })
  url?: string;
}

export class KakaoTemplateDto {
  @Expose()
  @ApiProperty({
    description: '카카오 템플릿 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '카카오 템플릿 상태',
    enum: KakaoTemplateStatus,
  })
  status: KakaoTemplateStatus;

  @Expose()
  @ApiProperty({
    description: '카테고리 코드',
    example: '100',
  })
  categoryCode: string;

  @Expose()
  @ApiProperty({
    description: '카카오 템플릿 내용',
    example: '주문 완료',
  })
  content: string;

  @Expose()
  @ApiProperty({
    description: '버튼',
    type: [KakaoTemplateButtons],
  })
  buttons: KakaoTemplateButtons[];

  @Expose()
  @ApiProperty({
    description: '추가 정보',
    example: '추가 정보',
  })
  extra: string;

  @Expose()
  @ApiProperty({
    description: '검수 코맨트',
    example: '검수 코맨트',
  })
  comments: string[];

  @Expose()
  @ApiProperty({
    description: '이미지 주소',
    example: 'https://naver.com',
  })
  imageUrl: string;

  @Exclude()
  imageId: string;

  @Exclude()
  templateId: string;

  @Exclude()
  messageTemplateId: number;

  @Exclude()
  kakaoCredentialId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class MessageDto {
  @Expose()
  @ApiProperty({
    description: '메시지 템플릿 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: '변수 할당',
    type: MessageVariablesDto,
    required: false,
  })
  @Type(() => MessageVariablesDto)
  variables?: MessageVariablesDto[];

  @Expose()
  @ApiProperty({
    description: '컨텐츠 그룹 ID',
    example: 1,
    nullable: true,
  })
  contentGroupId?: number;

  @ApiProperty({
    description: '메세지 배송 완료 여부',
    example: true,
  })
  @Expose()
  completeDelivery: boolean;

  @Expose()
  @ApiProperty({
    description: '컨텐츠 그룹',
    type: MessageContentGroupDto,
    nullable: true,
  })
  @Type(() => MessageContentGroupDto)
  contentGroup?: MessageContentGroupDto;

  @Expose()
  @ApiProperty({
    description: '카카오 템플릿',
    type: KakaoTemplateDto,
  })
  @Type(() => KakaoTemplateDto)
  kakaoTemplate: KakaoTemplateDto;

  @Expose()
  @ApiProperty({
    description: '전역 여부',
    example: false,
  })
  isGlobal: boolean;

  @Expose()
  @ApiProperty({
    description: '생성일',
    example: '2021-08-31T07:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: '수정일',
    example: '2021-08-31T07:00:00.000Z',
  })
  updatedAt: Date;

  @Exclude()
  workspaceId: number;

  @Exclude()
  kakaoTemplateId: string;

  @Exclude()
  deletedAt: Date;
}
