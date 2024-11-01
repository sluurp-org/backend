import { Controller, Get } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Serialize } from 'src/common/decorators/serialize.decorator';
import { PurchaseConfigDto } from './dto/res/purchase-config.dto';

@ApiTags('Purchase')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('config')
  @ApiOperation({
    summary: '결제 설정 조회',
    description: '결제 설정을 조회합니다.',
  })
  @Serialize(PurchaseConfigDto)
  @ApiOkResponse({
    type: PurchaseConfigDto,
  })
  public async getConfig() {
    return this.purchaseService.getConfig();
  }
}
