import {
  IsOptional,
  IsNotEmpty,
  ValidateIf,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SmartStoreCredentialsBodyDto } from './credentials/smartstore.dto';

class UpdateSmartStoreCredentialsBodyDto extends PartialType(
  SmartStoreCredentialsBodyDto,
) {}

export class UpdateStoreBodyDto {
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
    type: UpdateSmartStoreCredentialsBodyDto,
  })
  @ValidateIf((o) => o.smartStoreCredentials !== undefined)
  @Type(() => UpdateSmartStoreCredentialsBodyDto)
  @ValidateNested()
  @IsNotEmpty()
  smartStoreCredentials?: UpdateSmartStoreCredentialsBodyDto;
}
