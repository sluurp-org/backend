import { Module } from '@nestjs/common';
import { SmartplaceService } from './smartplace.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AwsModule } from 'src/aws/aws.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, AwsModule, HttpModule],
  providers: [SmartplaceService],
  exports: [SmartplaceService],
})
export class SmartplaceModule {}
