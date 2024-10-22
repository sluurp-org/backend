import { Controller, Get, Param } from '@nestjs/common';
import { EventHistoryService } from './event-history.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { UserEventHistoryDto } from './dto/res/event-history.dto';
import { UserEventHistoryDownloadDto } from './dto/res/event-history-download.dto';
import { UserEventHistoryRedirectDto } from './dto/res/event-history-redirect.dto';

@ApiTags('event-history')
@Controller('event-history')
export class EventHistoryController {
  constructor(private readonly eventHistoryService: EventHistoryService) {}

  @Get(':eventId')
  @Serialize(UserEventHistoryDto)
  @ApiOkResponse({ type: UserEventHistoryDto })
  @ApiOperation({ summary: '이벤트 기록 조회' })
  public async getEventHistory(@Param('eventId') eventId: string) {
    return this.eventHistoryService.findOne(eventId);
  }

  @Get(':eventId/download')
  @ApiOperation({ summary: '이벤트 기록 다운로드' })
  @ApiOkResponse({ type: UserEventHistoryDownloadDto })
  @Serialize(UserEventHistoryDownloadDto)
  public async downloadEventHistory(@Param('eventId') eventId: string) {
    return this.eventHistoryService.downloadEventHistory(eventId);
  }

  @Get(':eventId/confirm')
  @ApiOperation({ summary: '이벤트 기록 구매 확인 리다이렉트 URL 조회' })
  @ApiOkResponse({ type: UserEventHistoryRedirectDto })
  @Serialize(UserEventHistoryRedirectDto)
  public async getPurchaseConfirmRedirectUrl(
    @Param('eventId') eventId: string,
  ) {
    const url =
      await this.eventHistoryService.getPurchaseConfirmRedirectUrl(eventId);
    return { url };
  }

  @Get(':eventId/review')
  @ApiOperation({ summary: '이벤트 기록 리뷰 리다이렉트 URL 조회' })
  @ApiOkResponse({ type: UserEventHistoryRedirectDto })
  @Serialize(UserEventHistoryRedirectDto)
  public async getReviewRedirectUrl(@Param('eventId') eventId: string) {
    const url = await this.eventHistoryService.getReviewRedirectUrl(eventId);
    return { url };
  }
}
