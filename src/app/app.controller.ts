import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestSampleMessageBodyDto } from './dto/req/request-sample-message-body.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('alimtalk/send')
  @ApiOperation({
    summary: '테스트 알림톡 발송',
    description: '테스트 알림톡 발송 API',
  })
  public async sendAlimtalk(@Body() dto: RequestSampleMessageBodyDto) {
    return this.appService.sendAlimtalk(dto);
  }
}
