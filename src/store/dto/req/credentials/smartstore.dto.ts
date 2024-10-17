import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBcryptHashConstraint } from 'src/common/validator/hash.validator';

export class SmartStoreCredentialsBodyDto {
  @ApiProperty({
    description: '스마트스토어 아이디',
    example: 'wowid',
  })
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @ApiProperty({
    description: '스마트스토어 비밀키',
    example: 'wowsecret',
  })
  @IsString()
  @Validate(IsBcryptHashConstraint)
  @IsNotEmpty()
  applicationSecret: string;
}
