import { Controller } from '@nestjs/common';
import { NcommerceService } from './ncommerce.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ncommerce')
@Controller('ncommerce')
export class NcommerceController {
  constructor(private readonly ncommerceService: NcommerceService) {}
}
