import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TelegrafModule } from 'nestjs-telegraf';
import { WorkspaceMiddleware } from './workspace/middleware/workspace.middleware';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProductModule } from './product/product.module';
import { ContentModule } from './content/content.module';
import validationSchema from './config/config.schema';
import { PrismaModule } from './prisma/prisma.module';
import { KakaoModule } from './kakao/kakao.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { AppController } from './app/app.controller';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app/app.service';
import { OrderModule } from './order/order.module';
import { MessageModule } from './message/message.module';
import { WorkerModule } from './worker/worker.module';
import { CommandModule } from 'nestjs-command';
import { IsBcryptHashConstraint } from './common/validator/hash.validator';
import { NaverModule } from './naver/naver.module';
import { IsVariableConstraint } from './common/validator/variable.validator';
import { EventModule } from './event/event.module';
import { SqsModule } from '@ssut/nestjs-sqs';
import { PurchaseModule } from './purchase/purchase.module';
import { AwsModule } from './aws/aws.module';
import { PortoneModule } from './portone/portone.module';
import { MailModule } from './mail/mail.module';
import { EventHistoryModule } from './event-history/event-history.module';
import { EventHistoryWorkspaceModule } from './event-history-workspace/event-history-workspace.module';
import { TelegramModule } from './telegram/telegram.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        producers: [
          {
            name: 'commerce',
            region: configService.getOrThrow('AWS_REGION'),
            queueUrl: configService.getOrThrow('COMMERCE_SQS_QUEUE_URL'),
          },
        ],
      }),
    }),
    // TelegrafModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     token: configService.getOrThrow('TELEGRAM_BOT_TOKEN'),
    //   }),
    // }),
    KakaoModule,
    WorkspaceModule,
    UsersModule,
    AuthModule,
    StoreModule,
    ProductModule,
    OrderModule,
    ContentModule,
    MessageModule,
    WorkerModule,
    CommandModule,
    NaverModule,
    EventModule,
    PurchaseModule,
    AwsModule,
    PortoneModule,
    MailModule,
    EventHistoryModule,
    EventHistoryWorkspaceModule,
    TelegramModule,
    AnalyticsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, IsBcryptHashConstraint, IsVariableConstraint],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WorkspaceMiddleware).forRoutes({
      path: '/workspace/:workspaceId/*',
      method: RequestMethod.ALL,
    });
  }
}
