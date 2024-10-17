import { ApiProperty } from '@nestjs/swagger';
import { StoreType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { SmartStoreCredentialsDto } from './credentials/smartstore.dto';

export class StoreDto {
  @ApiProperty({
    example: 1,
    description: '스토어 ID',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: '스토어 이름',
    description: '스토어 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: StoreType.SMARTSTORE,
    description: '스토어 타입',
    enum: StoreType,
  })
  @Expose()
  type: StoreType;

  @ApiProperty({
    example: true,
    description: '스토어 활성화 여부',
  })
  @Expose()
  enabled: boolean;

  @ApiProperty({
    example: new Date(),
    description: '마지막 상품 동기화 시간',
  })
  @Expose()
  lastProductSyncAt: Date;

  @ApiProperty({
    example: new Date(),
    description: '마지막 주문 동기화 시간',
  })
  @Expose()
  lastOrderSyncAt: Date;

  @ApiProperty({
    type: SmartStoreCredentialsDto,
    description: '스마트스토어 정보',
    nullable: true,
  })
  @Type(() => SmartStoreCredentialsDto)
  @Expose()
  smartStoreCredentials?: SmartStoreCredentialsDto;

  @Exclude()
  workspaceId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
