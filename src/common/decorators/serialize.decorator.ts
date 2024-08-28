import { UseInterceptors } from '@nestjs/common';
import {
  ClassConstructor,
  SerializeInterceptor,
} from '../interceptor/serialize.interceptor';

export function Serialize(dto: ClassConstructor, paginated: boolean = false) {
  return UseInterceptors(new SerializeInterceptor(dto, paginated));
}
