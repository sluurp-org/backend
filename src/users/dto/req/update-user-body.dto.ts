import { PartialType } from '@nestjs/swagger';
import { CreateUserBodyDto } from './create-user-body.dto';

export class UpdateUserBodyDto extends PartialType(CreateUserBodyDto) {}
