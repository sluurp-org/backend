import { Module } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoController } from './kakao.controller';

@Module({
  controllers: [KakaoController],
  providers: [KakaoService],
  exports: [KakaoService],
})
export class KakaoModule {}
