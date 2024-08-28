import { Module } from '@nestjs/common';
import { NcommerceService } from './ncommerce.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NcommerceController } from './ncommerce.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('NCOMMERCE_API_URL'),
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    PrismaModule,
  ],
  providers: [NcommerceService],
  exports: [NcommerceService],
  controllers: [NcommerceController],
})
export class NcommerceModule {}
