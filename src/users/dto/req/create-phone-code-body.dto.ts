import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreatePhoneCodeBodyDto {
  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  @IsPhoneNumber('KR')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
