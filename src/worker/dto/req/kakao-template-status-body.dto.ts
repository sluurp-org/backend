import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoTemplateStatusBodyDto {
  @ApiProperty({
    description: '타이틀',
    example: '[솔라피] 알림톡 템플릿(kakao-template-27) 검수 알림',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
