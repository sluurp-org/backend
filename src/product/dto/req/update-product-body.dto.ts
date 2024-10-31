import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductBodyDto {
  @ApiProperty({
    description: '글로벌 이벤트 사용 여부',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  disableGlobalEvent?: boolean;
}
