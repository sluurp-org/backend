import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBillingBodyDto {
  @ApiProperty({
    description: '카드 번호',
    example: '1234567890123456',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    description: '만료 연도',
    example: '23',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  expiryYear: string;

  @ApiProperty({
    description: '만료 월',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  expiryMonth: string;

  @ApiProperty({
    description: '생년월일 또는 사업자 등록번호',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(6)
  birthOrBusinessRegistrationNumber: string;

  @ApiProperty({
    description: '비밀번호 앞 2자리',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  passwordTwoDigits: string;
}
