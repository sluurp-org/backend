import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ContentDto {
  @ApiProperty({
    description: '아이디',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '컨텐츠 그룹 아이디',
    example: 1,
  })
  @Expose()
  contentGroupId: number;

  @ApiProperty({
    description: '텍스트',
    example: '텍스트',
    nullable: true,
  })
  @Expose()
  text?: string;

  @ApiProperty({
    description: '파일명',
    example: '가나다',
    nullable: true,
  })
  @Expose()
  name?: number;

  @ApiProperty({
    description: '사용 여부',
    example: true,
  })
  @Expose()
  used: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  workspaceId: number;
}
