import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class VariablesDto {
  @ApiProperty({
    description: '변수명',
    example: 'name',
  })
  @Expose()
  key: string;

  @ApiProperty({
    description: '설명',
    example: 'description',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: '예시',
    example: 'example',
  })
  @Expose()
  example: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  value: string;

  @Exclude()
  id: number;
}
