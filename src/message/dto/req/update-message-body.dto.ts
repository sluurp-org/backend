import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateKakaoTemplateBodyDto } from './subtemplate/create-kakao-template-body.dto';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariableBodyDto } from './create-message-body.dto';

export class UpdateKakaoTemplateBodyDto extends PartialType(
  CreateKakaoTemplateBodyDto,
) {}

export class UpdateMessageBodyDto {
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: '컨텐츠 그룹 ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  contentGroupId?: number;

  @ApiProperty({
    description: '카카오 템플릿 정보',
    required: false,
    type: CreateKakaoTemplateBodyDto,
  })
  @IsOptional()
  @Type(() => CreateKakaoTemplateBodyDto)
  @ValidateNested()
  kakaoTemplate?: UpdateKakaoTemplateBodyDto;

  @ApiProperty({
    description: '변수 목록',
    type: CreateVariableBodyDto,
    isArray: true,
  })
  @IsOptional()
  @Type(() => CreateVariableBodyDto)
  @ValidateNested({ each: true })
  variables: CreateVariableBodyDto[];
}
