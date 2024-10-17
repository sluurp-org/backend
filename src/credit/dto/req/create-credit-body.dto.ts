import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCreditBodyDto {
  @ApiProperty({
    description: '크레딧 금액',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: '만료일',
    example: 7,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  expireAfterDays?: number;

  @ApiProperty({
    description: '사유',
    example: '크레딧 충전',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
