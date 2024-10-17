import { PartialType } from '@nestjs/swagger';
import { CreateOrderBodyDto } from './create-order-body.dto';

export class UpdateOrderBodyDto extends PartialType(CreateOrderBodyDto) {}
