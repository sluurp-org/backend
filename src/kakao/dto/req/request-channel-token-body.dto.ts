import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestChannelTokenBodyDto {
  @ApiProperty({
    description: '카카오 채널 검색용 아이디, @로 시작하는 아이디',
  })
  @IsString()
  @IsNotEmpty()
  searchId: string;

  @ApiProperty({
    description: '카카오 비즈니스 채널의 담당자 휴대폰 번호',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
