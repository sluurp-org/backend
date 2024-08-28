import { ApiProperty } from '@nestjs/swagger';
import { MessageTemplateType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateKakaoTemplateDto } from './kakao/create-kakao-template.dto';

export class CreateMessageDto {
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '메시지 템플릿 타입',
    example: MessageTemplateType.KAKAO,
    enum: MessageTemplateType,
  })
  @IsEnum(MessageTemplateType)
  @IsNotEmpty()
  type: MessageTemplateType;

  @ApiProperty({
    description: '카카오 템플릿 정보',
    type: CreateKakaoTemplateDto,
  })
  @ValidateIf((o) => o.type === MessageTemplateType.KAKAO)
  @IsNotEmpty()
  @Type(() => CreateKakaoTemplateDto)
  kakaoTemplate?: CreateKakaoTemplateDto;
}
