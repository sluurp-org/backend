import { forwardRef, Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CreditModule } from 'src/credit/credit.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CreditModule)],
  providers: [WorkspaceService],
  controllers: [WorkspaceController],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
