import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class GetSubscriptionProductsResponseDto {
  @ApiProperty({
    description: '구독 상품 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '구독 상품 이름',
    example: 'Basic',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '구독 상품 설명',
    example: 'Basic 플랜',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: '구독 상품 가격',
    example: 10000,
  })
  @Expose()
  price: number;

  @ApiProperty({
    description: '메시지 사용 여부',
    example: true,
  })
  @Expose()
  isMessageEnabled: boolean;

  @ApiProperty({
    description: '콘텐츠 사용 여부',
    example: true,
  })
  @Expose()
  isContentEnabled: boolean;

  @ApiProperty({
    description: '커스텀 카카오 사용 여부',
    example: true,
  })
  @Expose()
  isCustomKakaoEnabled: boolean;

  @ApiProperty({
    description: '콘텐츠 갯수',
    example: 3,
  })
  @Expose()
  contentLimit: number;

  @ApiProperty({
    description: '메시지 갯수',
    example: 1000,
  })
  @Expose()
  messageLimit: number;

  @ApiProperty({
    description: '스토어 갯수',
    example: 100,
  })
  @Expose()
  storeLimit: number;

  @ApiProperty({
    description: '콘텐츠 발송 가격',
    example: 10000,
  })
  @Expose()
  contentCredit: number;

  @ApiProperty({
    description: '알림톡 발송 가격',
    example: 10000,
  })
  @Expose()
  alimTalkCredit: number;

  @ApiProperty({
    description: '이메일 발송 가격',
    example: 10000,
  })
  @Expose()
  emailCredit: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
