import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KakaoModule } from 'src/kakao/kakao.module';

@Module({
  imports: [PrismaModule, KakaoModule],
  providers: [WorkspaceService],
  controllers: [WorkspaceController],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
