import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'eyJ...',
    description: '리프레시 토큰',
  })
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;
}
