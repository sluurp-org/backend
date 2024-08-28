import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SmartStoreCredentialsDto {
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
  @IsNotEmpty()
  applicationSecret: string;
}
