import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'example',
    description: '유저 아이디',
  })
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @ApiProperty({
    example: 'password',
    description: '비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
