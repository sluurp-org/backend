import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateKakaoTemplateBodyDto } from './subtemplate/create-kakao-template-body.dto';
import { MessageSendType, MessageTarget } from '@prisma/client';

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
    description: '메시지 배송 완료 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  completeDelivery?: boolean;

  @ApiProperty({
    description: '메시지 템플릿 발송 타입',
    example: MessageSendType.KAKAO,
    required: true,
  })
  @IsEnum(MessageSendType)
  @IsNotEmpty()
  sendType: MessageSendType;

  @ApiProperty({
    description: '카카오 템플릿 정보',
    type: CreateKakaoTemplateBodyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKakaoTemplateBodyDto)
  kakaoTemplate?: CreateKakaoTemplateBodyDto;

  @ApiProperty({
    description: '수신자 타입',
    example: MessageTarget.BUYER,
    enum: MessageTarget,
  })
  @IsEnum(MessageTarget)
  @IsNotEmpty()
  target: MessageTarget;

  @ApiProperty({
    description: '커스텀 전화번호',
    example: '01012345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsPhoneNumber('KR')
  customPhone?: string;

  @ApiProperty({
    description: '커스텀 이메일',
    example: 'test@test.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  customEmail?: string;
}
