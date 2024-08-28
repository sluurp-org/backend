import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ContentGroupDto } from './content-group.dto';

class ContentGroup extends PickType(ContentGroupDto, [
  'id',
  'name',
  'type',
  'provider',
]) {}

export class ContentGroupsDto {
  @ApiProperty({
    description: '컨텐츠 그룹 ID',
    type: [ContentGroup],
  })
  @Type(() => ContentGroup)
  @Expose()
  nodes: ContentGroup[];

  @ApiProperty({
    description: '컨텐츠 그룹 총 개수',
    example: 1,
  })
  @Expose()
  total: number;
}
