import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEventBodyDto } from './create-event-body.dto';

export class UpdateEventBodyDto extends PickType(CreateEventBodyDto, [
  'delayDays',
  'sendHour',
]) {
  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}
