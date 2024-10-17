import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UseCreditBodyDto {
  @ApiProperty({
    description: '사용할 크레딧 금액',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: '사용 사유',
    example: '크레딧 사용',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
