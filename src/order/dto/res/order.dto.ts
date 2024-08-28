import { $Enums } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty({
    description: '주문 고유 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
  })
  productOrderId: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  orderId: string;

  @ApiProperty({
    description: '주문 상태',
    example: $Enums.OrderStatus.PAY_WAITING,
    enum: $Enums.OrderStatus,
  })
  status: $Enums.OrderStatus;

  @ApiProperty({
    description: '스토어 ID',
    example: 2,
  })
  storeId: number;

  @ApiProperty({
    description: '상품 ID',
    example: 12345,
  })
  productId: number;

  @ApiProperty({
    description: '상품 변형 ID',
    example: 98765,
  })
  productVariantId: number;

  @ApiProperty({
    description: '워크스페이스 ID',
    example: 101,
  })
  workspaceId: number;

  @ApiProperty({
    description: '주문자 이름',
    example: '홍길동',
  })
  ordererName: string;

  @ApiProperty({
    description: '주문자 이메일',
    example: 'example@example.com',
  })
  ordererEmail: string;

  @ApiProperty({
    description: '주문자 전화번호',
    example: '010-1234-5678',
  })
  ordererPhone: string;

  @ApiProperty({
    description: '수령자 이름',
    example: '김철수',
  })
  receiverName: string;

  @ApiProperty({
    description: '수령자 전화번호',
    example: '010-9876-5432',
  })
  receiverPhone: string;

  @ApiProperty({
    description: '가격',
    example: 10000,
  })
  price: number;

  @ApiProperty({
    description: '수량',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: '주문 날짜',
    example: '2024-08-26T10:30:00.000Z',
  })
  orderAt: Date;

  @ApiProperty({
    description: '배송 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  deliveryAddress: string;

  @ApiProperty({
    description: '배송 메시지',
    example: '문 앞에 놓아주세요.',
  })
  deliveryMessage: string;

  @ApiProperty({
    description: '배송 업체',
    example: 'CJ대한통운',
  })
  deliveryCompany: string;

  @ApiProperty({
    description: '배송 추적 번호',
    example: '123456789',
  })
  deliveryTrackingNumber: string;

  @ApiProperty({
    description: '생성 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '업데이트 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '삭제 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  deletedAt: Date;
}
