import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserEventHistoryRedirectDto {
  @Expose()
  @ApiProperty({
    description: '리다이렉트 URL',
    example: 'https://example.com',
  })
  url: string;
}
