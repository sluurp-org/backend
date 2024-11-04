import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';

export class FindWorkspaceAnalyticsQueryDto {
  @ApiProperty({
    description: '시작 날짜',
    example: '2021-01-01',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: '종료 날짜',
    example: '2021-12-31',
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
