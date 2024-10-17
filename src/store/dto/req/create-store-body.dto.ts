import { IsString, IsEnum, ValidateIf, IsNotEmpty } from 'class-validator';
import { StoreType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SmartStoreCredentialsBodyDto } from './credentials/smartstore.dto';

export class CreateStoreBodyDto {
  @ApiProperty({
    description: '스토어 이름',
    example: '스르륵 스마트 스토어',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '스토어 타입',
    example: StoreType.SMARTSTORE,
    enum: StoreType,
  })
  @IsEnum(StoreType)
  @IsNotEmpty()
  type: StoreType;

  @ApiProperty({
    description: '스마트스토어 정보',
    type: SmartStoreCredentialsBodyDto,
  })
  @ValidateIf((o) => o.type === StoreType.SMARTSTORE)
  @Type(() => SmartStoreCredentialsBodyDto)
  smartStoreCredentials?: SmartStoreCredentialsBodyDto;
}
