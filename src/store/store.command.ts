import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Command } from 'nestjs-command';
import { StoreType } from '@prisma/client';
import { SqsService } from '@ssut/nestjs-sqs';

@Injectable()
export class StoreCommand {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sqsService: SqsService,
  ) {}

  @Command({
    command: 'cron:store',
    describe: 'Fetch store data and put it in the sqs',
  })
  async handle() {
    const stores = await this.prismaService.store.findMany({
      where: {
        enabled: true,
        type: StoreType.SMARTSTORE,
        smartStoreCredentials: {
          isNot: null,
        },
      },
      include: { smartStoreCredentials: true },
    });

    const sqsPayload = stores
      .filter((store) => store.smartStoreCredentials)
      .map((store) => ({
        id: store.id.toString() + new Date().getTime().toString(),
        body: JSON.stringify({
          payload: {
            applicationId: store.smartStoreCredentials?.applicationId,
            applicationSecret: store.smartStoreCredentials?.applicationSecret,
            emailParseable: store.smartStoreCredentials?.emailParseable,
          },
          lastSyncedAt: store.lastOrderSyncAt,
          provider: 'SMARTSTORE',
          storeId: store.id,
        }),
      }));

    console.log(`Sending ${sqsPayload.length} messages to SQS`);
    await this.sqsService.send('commerce', sqsPayload);
    console.log('Messages sent to SQS');
  }
}
