import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserBodyDto } from './create-user-body.dto';

export class UpdateUserBodyDto extends PartialType(
  PickType(CreateUserBodyDto, ['name', 'password']),
) {}
