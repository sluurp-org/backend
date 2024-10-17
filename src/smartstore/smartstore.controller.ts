import { Controller } from '@nestjs/common';
import { SmartstoreService } from './smartstore.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('smartstore')
@Controller('smartstore')
export class SmartstoreController {
  constructor(private readonly smartstoreService: SmartstoreService) {}
}
