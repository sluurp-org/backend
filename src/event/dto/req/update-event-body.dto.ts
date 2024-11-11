import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEventBodyDto {
  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}
