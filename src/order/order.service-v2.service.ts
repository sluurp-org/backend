import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderHistoryType, OrderStatus, Prisma } from '@prisma/client';
import {
  UpsertOrderBodyDto,
  UpsertOrdersBatchBodyDto,
} from './dto/req/upsert-orders-batch-body.dto';
import { EventService } from 'src/event/event.service';

@Injectable()
export class OrderV2Service {
  private readonly logger = new Logger(OrderV2Service.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) {}
}
