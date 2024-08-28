import {
  IsOptional,
  IsNotEmpty,
  ValidateIf,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { SmartStoreCredentialsDto } from './credentials/smartstore.dto';
import { Type } from 'class-transformer';

class UpdateSmartStoreCredentialsDto extends PartialType(
  SmartStoreCredentialsDto,
) {}

export class UpdateStoreDto {
  @ApiProperty({
    description: '스토어 이름',
    example: '스르륵 스마트 스토어',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '스토어 활성화 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: '스마트스토어 정보',
    type: UpdateSmartStoreCredentialsDto,
  })
  @ValidateIf((o) => o.smartStoreCredentials !== undefined)
  @IsNotEmpty()
  @Type(() => UpdateSmartStoreCredentialsDto)
  smartStoreCredentials?: UpdateSmartStoreCredentialsDto;
}
