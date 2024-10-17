import { Module } from '@nestjs/common';
import { PortoneService } from './portone.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PORTONE_API_URL'),
        headers: {
          Authorization: `PortOne ${configService.get('PORTONE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
      }),
    }),
  ],
  providers: [PortoneService],
  exports: [PortoneService],
})
export class PortoneModule {}
