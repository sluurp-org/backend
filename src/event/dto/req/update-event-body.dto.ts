import { PartialType } from '@nestjs/swagger';
import { CreateEventBodyDto } from './create-event-body.dto';

export class UpdateEventBodyDto extends PartialType(CreateEventBodyDto) {}
