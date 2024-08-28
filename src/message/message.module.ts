import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { KakaoModule } from 'src/kakao/kakao.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, WorkspaceModule, KakaoModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
