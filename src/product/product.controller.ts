import { Workspace, WorkspaceRole } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { ProductService } from './product.service';
import { ProductsDto } from './dto/products.dto';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/product.dto';
import { GetProductDto } from './dto/get-product.dto';

@ApiTags('product')
@WorkspaceController('product')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({
    summary: '상품 리스트',
    description: '워크스페이스의 상품 리스트를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 리스트를 조회합니다.',
    type: ProductsDto,
  })
  @Get()
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findAll(
    @ReqWorkspace() workspace: Workspace,
    @Query() getProductDto: GetProductDto,
  ) {
    const products = await this.productService.findMany(
      workspace.id,
      getProductDto,
    );
    return plainToInstance(ProductsDto, products, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({
    summary: '상품 조회',
    description: '워크스페이스의 상품 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 정보를 조회합니다.',
    type: ProductDto,
  })
  @Get(':productId')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findOne(
    @ReqWorkspace() workspace: Workspace,
    @Param('productId') productId: number,
  ) {
    const product = await this.productService.findOne(productId, workspace.id);
    return plainToInstance(ProductDto, product, {
      excludeExtraneousValues: true,
    });
  }
}
