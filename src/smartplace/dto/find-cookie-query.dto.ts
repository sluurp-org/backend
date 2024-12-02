import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindCookieQueryDto {
  @ApiProperty({
    description: 'username',
    example: 'username',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'password',
    example: 'youshallnotpass',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
