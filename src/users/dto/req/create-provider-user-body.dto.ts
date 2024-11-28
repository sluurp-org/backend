import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProviderUserBodyDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  @IsPhoneNumber('KR')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: '인증 코드',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '프로바이더 아이디',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    description: '프로바이더',
    enum: Provider,
    example: Provider.GOOGLE,
  })
  @IsEnum(Provider)
  @IsNotEmpty()
  provider: Provider;
}
