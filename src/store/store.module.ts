import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { NcommerceModule } from 'src/ncommerce/ncommerce.module';
import { StoreCommand } from './store.command';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        producers: [
          {
            name: 'commerce',
            region: configService.get('AWS_REGION'),
            queueUrl: configService.get('COMMERCE_SQS_QUEUE_URL'),
          },
        ],
      }),
    }),
    PrismaModule,
    WorkspaceModule,
    NcommerceModule,
  ],
  controllers: [StoreController],
  providers: [StoreService, StoreCommand],
  exports: [StoreService],
})
export class StoreModule {}
