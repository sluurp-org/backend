import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SmartPlaceCredentialsBodyDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 'wowid',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '유저 비밀번호',
    example: 'wowsecret',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '비즈니스 아이디',
    example: 'wowsecret',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;
}
