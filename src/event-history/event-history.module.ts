import { Module } from '@nestjs/common';
import { EventHistoryService } from './event-history.service';
import { EventHistoryController } from './event-history.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [PrismaModule, AwsModule],
  providers: [EventHistoryService],
  controllers: [EventHistoryController],
})
export class EventHistoryModule {}
