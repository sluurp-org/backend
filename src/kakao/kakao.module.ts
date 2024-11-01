import { Module } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoController } from './kakao.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    PrismaModule,
    WorkspaceModule,
    HttpModule.register({
      baseURL: 'https://api.solapi.com',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    TelegramModule,
  ],
  controllers: [KakaoController],
  providers: [KakaoService],
  exports: [KakaoService],
})
export class KakaoModule {}
