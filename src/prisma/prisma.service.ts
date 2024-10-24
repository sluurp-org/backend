import { createPrismaQueryEventHandler } from 'prisma-query-log';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);
  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();


    if (this.configService.get('NODE_ENV') === 'development') {
      const log = createPrismaQueryEventHandler({
        logger: (query) => this.logger.verbose(query),
      });
      this.$on('query', log);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
