import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    example: 'accessToken',
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: 'refreshToken',
    description: '리프레시 토큰',
  })
  refreshToken: string;
}
