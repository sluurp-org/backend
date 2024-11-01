import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordByCodeDto {
  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  @IsPhoneNumber('KR')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: '코드',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 0,
      minSymbols: 0,
      minUppercase: 0,
    },
    {
      message: '비밀번호는 최소 8자리, 1개 이상의 소문자를 포함해야 합니다.',
    },
  )
  password: string;
}
