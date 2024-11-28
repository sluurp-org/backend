import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}
