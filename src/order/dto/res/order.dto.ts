import { $Enums } from '@prisma/client';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StoreListDto } from 'src/store/dto/res/store-list.dto';
import { ProductDto } from 'src/product/dto/res/product.dto';
import { ProductVariantDto } from 'src/product/dto/res/product-variant.dto';

export class OrderStoreDto extends PickType(ProductDto, [
  'id',
  'name',
  'productImageUrl',
  'productId',
]) {}

export class OrderDto {
  @ApiProperty({
    description: '주문 고유 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
  })
  @Expose()
  productOrderId: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: '주문 상태',
    example: $Enums.OrderStatus.PAY_WAITING,
    enum: $Enums.OrderStatus,
  })
  @Expose()
  status: $Enums.OrderStatus;

  @ApiProperty({
    description: '스토어',
    type: StoreListDto,
  })
  @Expose()
  @Type(() => StoreListDto)
  store: StoreListDto;

  @ApiProperty({
    description: '상품',
    type: ProductDto,
  })
  @Expose()
  @Type(() => ProductDto)
  product: ProductDto;

  @Exclude()
  productVariantId: number;

  @Expose()
  @ApiProperty({
    description: '상품 옵션',
    type: ProductVariantDto,
  })
  @Type(() => ProductVariantDto)
  productVariant: ProductVariantDto;

  @ApiProperty({
    description: '워크스페이스 ID',
    example: 101,
  })
  @Expose()
  workspaceId: number;

  @ApiProperty({
    description: '주문자 이름',
    example: '홍길동',
  })
  @Expose()
  ordererName: string;

  @ApiProperty({
    description: '주문자 이메일',
    example: 'example@example.com',
  })
  @Expose()
  ordererEmail: string;

  @ApiProperty({
    description: '주문자 전화번호',
    example: '010-1234-5678',
  })
  @Expose()
  ordererPhone: string;

  @ApiProperty({
    description: '수령자 이름',
    example: '김철수',
  })
  @Expose()
  receiverName: string;

  @ApiProperty({
    description: '수령자 전화번호',
    example: '010-9876-5432',
  })
  @Expose()
  receiverPhone: string;

  @ApiProperty({
    description: '수령자 이메일',
    example: 'example@example.com',
  })
  @Expose()
  receiverEmail: string;

  @ApiProperty({
    description: '가격',
    example: 10000,
  })
  @Expose()
  price: number;

  @ApiProperty({
    description: '수량',
    example: 2,
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: '주문 날짜',
    example: '2024-08-26T10:30:00.000Z',
  })
  @Expose()
  orderAt: Date;

  @ApiProperty({
    description: '배송 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @Expose()
  deliveryAddress: string;

  @ApiProperty({
    description: '배송 메시지',
    example: '문 앞에 놓아주세요.',
  })
  @Expose()
  deliveryMessage: string;

  @ApiProperty({
    description: '배송 업체',
    example: 'CJ대한통운',
  })
  @Expose()
  deliveryCompany: string;

  @ApiProperty({
    description: '배송 추적 번호',
    example: '123456789',
  })
  @Expose()
  deliveryTrackingNumber: string;

  @ApiProperty({
    description: '생성 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  @Exclude()
  createdAt: Date;

  @ApiProperty({
    description: '업데이트 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  @Exclude()
  updatedAt: Date;

  @ApiProperty({
    description: '삭제 일자',
    example: '2024-08-26T10:30:00.000Z',
  })
  @Exclude()
  deletedAt: Date;
}
