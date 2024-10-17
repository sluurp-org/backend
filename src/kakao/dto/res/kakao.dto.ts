import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class KakaoDto {
  @ApiProperty({
    description: '카카오 채널 검색용 아이디, @로 시작하는 아이디',
  })
  @Expose()
  searchId: string;

  @ApiProperty({
    description: '카카오 채널 고유 아이디',
  })
  @Expose()
  channelId: string;
}
