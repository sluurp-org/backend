import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class ContentGroupDto {
  @ApiProperty({
    description: '컨텐츠 그룹 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '컨텐츠 그룹 이름',
    example: '컨텐츠 그룹',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '컨텐츠 그룹 타입',
    example: ContentType.TEXT,
    enum: ContentType,
  })
  @Expose()
  type: ContentType;

  @ApiProperty({
    description: '일회성 컨텐츠 여부',
    example: '일회성 컨텐츠 여부',
  })
  @Expose()
  oneTime: boolean;

  @ApiProperty({
    description: '컨텐츠 그룹 만료 시간(분)',
    example: 60,
  })
  @Expose()
  expireMinute: number;

  @ApiProperty({
    description: '컨텐츠 그룹 다운로드 제한 횟수',
    example: 1,
  })
  @Expose()
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
