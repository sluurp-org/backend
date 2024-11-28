import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDto {
  @ApiProperty({
    example: 'accessToken',
    description: '액세스 토큰',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    example: 'refreshToken',
    description: '리프레시 토큰',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    example: true,
    description: '회원가입 필요 여부',
    nullable: true,
  })
  @Expose()
  isRegister?: boolean;

  @ApiProperty({
    example: 'id',
    description: '사용자 아이디',
    nullable: true,
  })
  @Expose()
  id?: string;
}
