import { Module } from '@nestjs/common';
import { NaverService } from './naver.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('NAVER_API_URL'),
      }),
    }),
  ],
  providers: [NaverService],
  exports: [NaverService],
})
export class NaverModule {}
