import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RequestSampleMessageBodyDto {
  @ApiProperty({
    example: '01012345678',
    description: '수신번호',
  })
  @IsPhoneNumber('KR', { message: '수신번호가 유효하지 않습니다.' })
  @IsNotEmpty()
  to: string;
}
