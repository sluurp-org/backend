import { ApiProperty } from '@nestjs/swagger';
import { CreditType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class CreditDto {
  @ApiProperty({
    example: 1,
    description: '크레딧 ID',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 100,
    description: '지급된 크레딧',
  })
  @Expose()
  amount: number;

  @ApiProperty({
    example: 1,
    description: '남은 크레딧',
  })
  @Expose()
  remainAmount: number;

  @ApiProperty({
    example: CreditType.USE,
    enum: CreditType,
    description: '크레딧 타입',
  })
  @Expose()
  type: CreditType;

  @ApiProperty({
    example: '2021-08-01T00:00:00.000Z',
    description: '크레딧 만료일',
    nullable: true,
  })
  @Expose()
  expireAt?: Date;

  @ApiProperty({
    example: '크레딧 사용',
    description: '크레딧 사용 사유',
    nullable: true,
  })
  @Expose()
  reason?: string;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
