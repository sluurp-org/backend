import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindOrderQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '주문 고유 ID',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: '스토어 ID',
    example: 2,
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  storeId?: number;

  @ApiProperty({
    description: '상품 주문 ID',
    example: '2024019230123408',
    required: false,
  })
  @IsString()
  @IsOptional()
  productOrderId?: string;

  @ApiProperty({
    description: '주문 ID',
    example: '2024019230123408',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: '주문 상태',
    example: OrderStatus.CANCEL,
    enum: OrderStatus,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
