import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateContentBodyDto {
  @ApiProperty({
    description: '텍스트',
    example: '텍스트',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  text: string[];
}
