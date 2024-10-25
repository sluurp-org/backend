import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AdditionalPaymentQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '구독 아이디',
    example: 1,
  })
  subscriptionId: number;
}
