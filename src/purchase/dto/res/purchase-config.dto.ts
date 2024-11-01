import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class PurchaseConfigDto {
  @Exclude()
  id: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '기본 결제 금액',
  })
  defaultPrice: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '알림톡 단가',
  })
  alimtalkSendPrice: number;

  @Expose()
  @ApiProperty({
    example: 0,
    description: '콘텐츠 단가',
  })
  contentSendPrice: number;
}
