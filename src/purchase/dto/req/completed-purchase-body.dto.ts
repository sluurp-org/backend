import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePurchaseBodyDto {
  @ApiProperty({
    description: '주문 id',
    example: 'oaiwef',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}
