import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class UpdateLastFetchStoreDto {
  @ApiProperty({
    description: '마지막 조회 시간',
    example: '2021-07-27T07:00:00.000Z',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  lastSyncedAt: Date;
}
