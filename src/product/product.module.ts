import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
