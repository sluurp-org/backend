import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AwsModule } from 'src/aws/aws.module';
import { KakaoModule } from 'src/kakao/kakao.module';

@Module({
  imports: [PrismaModule, WorkspaceModule, AwsModule, KakaoModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
