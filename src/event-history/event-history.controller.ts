import { Controller, Get, Param } from '@nestjs/common';
import { EventHistoryService } from './event-history.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Event History')
@Controller('event-history')
export class EventHistoryController {
  constructor(private readonly eventHistoryService: EventHistoryService) {}

  @Get(':eventId')
  public async getEventHistory(@Param('eventId') eventId: string) {
    return this.eventHistoryService.findOne(eventId);
  }

  @Get(':eventId/download')
  public async downloadEventHistory(@Param('eventId') eventId: string) {
    return this.eventHistoryService.downloadEventHistory(eventId);
  }

  @Get(':eventId/confirm')
  public async getPurchaseConfirmRedirectUrl(
    @Param('eventId') eventId: string,
  ) {
    const url =
      await this.eventHistoryService.getPurchaseConfirmRedirectUrl(eventId);
    return { url };
  }

  @Get(':eventId/review')
  public async getReviewRedirectUrl(@Param('eventId') eventId: string) {
    const url = await this.eventHistoryService.getReviewRedirectUrl(eventId);
    return { url };
  }
}
