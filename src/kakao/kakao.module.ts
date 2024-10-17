import { Module } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoController } from './kakao.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

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
  ],
  controllers: [KakaoController],
  providers: [KakaoService],
  exports: [KakaoService],
})
export class KakaoModule {}
