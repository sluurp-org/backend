import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCreditPurchaseOrderBodyDto {
  @ApiProperty({
    description: '금액',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
