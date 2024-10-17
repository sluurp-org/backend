import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContentGroupBodyDto {
  @ApiProperty({
    description: '컨텐츠 그룹 이름',
    example: '테스트 컨텐츠 그룹',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '컨텐츠 그룹 타입',
    example: ContentType.TEXT,
    default: ContentType.TEXT,
    enum: ContentType,
  })
  @IsEnum(ContentType)
  @IsNotEmpty()
  type: ContentType;

  @ApiProperty({
    description: '일회성 컨텐츠 여부',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  oneTime: boolean;

  @ApiProperty({
    description: '컨텐츠 그룹 만료 시간(분)',
    example: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  expireMinute?: number;

  @ApiProperty({
    description: '컨텐츠 그룹 다운로드 제한 횟수',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  downloadLimit?: number;
}
