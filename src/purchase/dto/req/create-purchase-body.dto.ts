import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePurchaseBodyDto {
  @ApiProperty({
    description: '구매할 구독 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number;
}
