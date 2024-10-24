import { Controller, Get } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { GetSubscriptionProductsResponseDto } from './dto/res/subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({
    summary: '구독 상품 목록 조회',
    description: '워크스페이스의 구독 상품 목록을 조회합니다.',
  })
  @Serialize(GetSubscriptionProductsResponseDto)
  @ApiResponse({
    type: GetSubscriptionProductsResponseDto,
    isArray: true,
  })
  public async getSubscriptionProducts() {
    return this.subscriptionService.getSubscriptionProducts();
  }
}
