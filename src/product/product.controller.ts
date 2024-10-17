import { Workspace, WorkspaceRole } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Get, Param, Post, Query } from '@nestjs/common';

import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { ProductService } from './product.service';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/res/product.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { FindProductQueryDto } from './dto/req/find-product-query.dto';
import { ProductVariantDto } from './dto/res/product-variant.dto';
import { StoreService } from 'src/store/store.service';
import { FindProductOptionQueryDto } from './dto/req/find-product-option-query.dto';

@ApiTags('product')
@WorkspaceController('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {}

  @ApiOperation({
    summary: '상품 리스트',
    description: '워크스페이스의 상품 리스트를 조회합니다.',
  })
  @Serialize(ProductDto, true)
  @ApiOkResponsePaginated(ProductDto)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  @Get()
  async findAll(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindProductQueryDto,
  ) {
    const nodes = await this.productService.findMany(id, dto);
    const total = await this.productService.count(id, dto);

    return {
      total,
      nodes,
    };
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
  @Serialize(ProductDto)
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

  @ApiOperation({
    summary: '상품 옵션 조회',
    description: '워크스페이스의 상품 옵션 정보를 조회합니다.',
  })
  @ApiOkResponsePaginated(ProductVariantDto)
  @Get(':productId/options')
  @Serialize(ProductVariantDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async findOptions(
    @ReqWorkspace() workspace: Workspace,
    @Param('productId') productId: number,
    @Query() dto: FindProductOptionQueryDto,
  ) {
    const nodes = await this.productService.findOptions(
      productId,
      workspace.id,
      dto,
    );
    const total = await this.productService.countOptions(
      productId,
      workspace.id,
      dto,
    );

    return {
      total,
      nodes,
    };
  }

  @ApiOperation({
    summary: '상품 옵션 동기화',
    description: '워크스페이스의 상품 옵션 정보를 동기화합니다.',
  })
  @Post(':productId/options/sync')
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  async syncOptions(
    @ReqWorkspace() workspace: Workspace,
    @Param('productId') productId: number,
  ) {
    return this.storeService.syncOption(workspace.id, productId);
  }
}
