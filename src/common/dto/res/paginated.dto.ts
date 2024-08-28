/* eslint-disable @typescript-eslint/ban-types */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class PaginatedResponseDto<T> {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '노드 개수',
  })
  total: number;

  @Expose()
  @ApiProperty()
  @Type((options) => {
    if (!options) {
      return null;
    }

    return (options.newObject as PaginatedResponseDto<T>).type as any;
  })
  nodes: T[];

  @Exclude()
  private type?: Function;

  constructor(type: Function) {
    this.type = type;
  }
}
