import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, Validate } from 'class-validator';

export class FindStoreAnalyticsQueryDto {
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
  @Validate((endDate: Date, args) => {
    const { startDate } = args.object;
    return endDate > startDate
      ? true
      : {
          message: '종료 날짜는 시작 날짜보다 커야 합니다.',
        };
  })
  endDate: Date;
}
