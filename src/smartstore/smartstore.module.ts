import { Module } from '@nestjs/common';
import { SmartstoreService } from './smartstore.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmartstoreController } from './smartstore.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('SMARTSTORE_API_URL'),
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    PrismaModule,
  ],
  providers: [SmartstoreService],
  exports: [SmartstoreService],
  controllers: [SmartstoreController],
})
export class SmartstoreModule {}
