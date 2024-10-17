import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateContentBodyDto {
  @ApiProperty({
    description: '텍스트',
    example: '텍스트',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: '파일 상태',
    enum: ContentStatus,
  })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}
