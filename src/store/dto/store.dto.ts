import { ApiProperty } from '@nestjs/swagger';
import { StoreType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class StoreDto {
  @ApiProperty({
    example: 1,
    description: '스토어 ID',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: '스토어 이름',
    description: '스토어 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: StoreType.SMARTSTORE,
    description: '스토어 타입',
    enum: StoreType,
  })
  @Expose()
  type: StoreType;

  @ApiProperty({
    example: true,
    description: '스토어 활성화 여부',
  })
  @Expose()
  enabled: boolean;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
