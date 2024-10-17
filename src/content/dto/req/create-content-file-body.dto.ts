import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContentFileBodyDto {
  @ApiProperty({
    description: '파일 이름',
    example: '파일 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '파일 크기',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: '파일 MIME 타입',
    example: 'image/png',
    required: false,
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: '파일 Extension',
    example: 'png',
  })
  @IsString()
  @IsNotEmpty()
  extension: string;
}
