import { Module } from '@nestjs/common';
import { KakaoAuthService } from './kakao-auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [KakaoAuthService],
  exports: [KakaoAuthService],
})
export class KakaoAuthModule {}
