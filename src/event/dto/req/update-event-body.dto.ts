import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEventBodyDto } from './create-event-body.dto';

export class UpdateEventBodyDto extends PartialType(
  PickType(CreateEventBodyDto, ['delayDays', 'sendHour', 'type']),
) {
  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}
