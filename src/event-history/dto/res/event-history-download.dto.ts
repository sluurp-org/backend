import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEventHistoryDownloadDto {
  @Expose()
  @ApiProperty({
    description: '다운로드 URL',
    example: 'https://example.com/download',
    nullable: true,
  })
  url?: string;

  @Exclude()
  @ApiProperty({
    description: '다운로드 텍스트',
    example: '다운로드 텍스트',
    nullable: true,
  })
  text?: string;

  @Expose()
  @ApiProperty({
    description: '다운로드 타입',
    example: ContentType.FILE,
    enum: ContentType,
  })
  type: ContentType;
}
