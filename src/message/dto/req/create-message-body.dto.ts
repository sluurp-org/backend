import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateKakaoTemplateBodyDto } from './subtemplate/create-kakao-template-body.dto';

export class CreateVariableBodyDto {
  @ApiProperty({
    description: '변수 이름',
    example: 'name',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: '변수 값',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateMessageBodyDto {
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
  })
  @IsString()
  @IsNotEmpty()
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
    type: CreateKakaoTemplateBodyDto,
  })
  @IsNotEmpty()
  @Type(() => CreateKakaoTemplateBodyDto)
  @ValidateNested()
  kakaoTemplate?: CreateKakaoTemplateBodyDto;

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
