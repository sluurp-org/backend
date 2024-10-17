import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [PrismaModule, WorkspaceModule, StoreModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
