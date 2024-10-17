import { PartialType, PickType } from '@nestjs/swagger';
import { CreateContentGroupBodyDto } from './create-content-group-body.dto';

export class UpdateContentGroupBodyDto extends PartialType(
  PickType(CreateContentGroupBodyDto, [
    'name',
    'downloadLimit',
    'expireMinute',
  ]),
) {}
