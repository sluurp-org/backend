import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderBodyDto {
  @ApiProperty({
    description: '스토어 아이디',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({
    description: '상품 ID',
    example: '12345',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: '상품 옵션 ID',
    example: '98765',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  productVariantId?: number;

  @ApiProperty({
    description: '주문 상태',
    example: OrderStatus.PAY_WAITING,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({
    description: '주문자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  ordererName: string;

  @ApiProperty({
    description: '주문자 전화번호',
    example: '01012345678',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  ordererPhone: string;

  @ApiProperty({
    description: '주문자 이메일',
    example: 'example@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  ordererEmail?: string;

  @ApiProperty({
    description: '수령자 이름',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty({
    description: '수령자 전화번호',
    example: '010-9876-5432',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @ApiProperty({
    description: '주문자 이메일',
    example: 'example@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  receiverEmail?: string;

  @ApiProperty({
    description: '가격',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({
    description: '수량',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty({
    description: '주문 날짜',
    example: '2024-08-26T10:30:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  orderAt: Date;

  @ApiProperty({
    description: '배송 주소',
    example: '서울특별시 강남구 테헤란로 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiProperty({
    description: '배송 메시지',
    example: '문 앞에 놓아주세요.',
    required: false,
  })
  @IsString()
  @IsOptional()
  deliveryMessage?: string;

  @ApiProperty({
    description: '배송 업체',
    example: 'CJ대한통운',
    required: false,
  })
  @IsString()
  @IsOptional()
  deliveryCompany?: string;

  @ApiProperty({
    description: '배송 번호',
    example: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  deliveryTrackingNumber?: string;
}
