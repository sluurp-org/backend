import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WorkspaceMiddleware } from './workspace/middleware/workspace.middleware';
import { NcommerceModule } from './ncommerce/ncommerce.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProductModule } from './product/product.module';
import { ContentModule } from './content/content.module';
import validationSchema from './config/config.schema';
import { PrismaModule } from './prisma/prisma.module';
import { KakaoModule } from './kakao/kakao.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { MessageModule } from './message/message.module';
import { WorkerModule } from './worker/worker.module';
import { CommandModule } from 'nestjs-command';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    KakaoModule,
    WorkspaceModule,
    UsersModule,
    AuthModule,
    StoreModule,
    NcommerceModule,
    ProductModule,
    OrderModule,
    ContentModule,
    MessageModule,
    WorkerModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WorkspaceMiddleware).forRoutes({
      path: '/workspace/:workspaceId/*',
      method: RequestMethod.ALL,
    });
  }
}
