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
}
