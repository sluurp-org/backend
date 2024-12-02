import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SmartPlaceCredentialsDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 'wowid',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: '유저 비밀번호',
    example: 'wowsecret',
  })
  @Expose()
  password: string;

  @ApiProperty({
    description: '비즈니스 아이디',
    example: 'wowsecret',
  })
  @Expose()
  channelId: string;
}
