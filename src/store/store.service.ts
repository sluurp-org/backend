import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreBodyDto } from './dto/create-store-body.dto';
import { Prisma, StoreType } from '@prisma/client';
import { UpdateStoreDto } from './dto/update-store.dto';
import { NcommerceService } from 'src/ncommerce/ncommerce.service';
import { GetStoreDto } from './dto/get-store.dto';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ncommerceService: NcommerceService,
  ) {}

  public async findMany(workspaceId: number, getStoreDto: GetStoreDto) {
    const { type, enabled, name, skip, take } = getStoreDto;
    try {
      const nodes = await this.prismaService.store.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          type,
          enabled,
          name: name && { contains: name },
        },
        skip,
        take,
      });

      const total = await this.prismaService.store.count({
        where: {
          workspaceId,
          deletedAt: null,
          type,
          enabled,
          name: { contains: name },
        },
      });
      return { nodes, total };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 불러오는데 실패하였습니다.',
      );
    }
  }

  public async findOne(storeId: number, workspaceId: number) {
    try {
      const store = await this.prismaService.store.findUnique({
        where: { id: storeId, workspaceId, deletedAt: null },
        include: { smartStoreCredentials: true },
      });
      if (!store)
        throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

      return store;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 불러오는데 실패하였습니다.',
      );
    }
  }

  public async findOneByWorkspaceId(workspaceId: number) {
    try {
      const stores = await this.prismaService.store.findMany({
        where: { workspaceId, deletedAt: null },
        include: { smartStoreCredentials: true },
      });

      return stores;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 불러오는데 실패하였습니다.',
      );
    }
  }

  public async create(
    workspaceId: number,
    createStoreBodyDto: CreateStoreBodyDto,
  ) {
    const { type, smartStoreCredentials, ...rest } = createStoreBodyDto;

    if (type === StoreType.SMARTSTORE && !smartStoreCredentials)
      throw new BadRequestException(
        '스마트스토어 타입의 스토어는 스마트스토어 정보를 입력해야 합니다.',
      );

    const storeData: Prisma.StoreCreateInput = {
      ...rest,
      type,
      workspace: { connect: { id: workspaceId } },
    };

    if (type === StoreType.SMARTSTORE) {
      const { applicationId, applicationSecret } = smartStoreCredentials;

      const storeInfo = await this.ncommerceService.getStoreInfo(
        applicationId,
        applicationSecret,
      );
      const storeExists =
        await this.prismaService.smartStoreCredentials.findUnique({
          where: { channelId: storeInfo.channelId, deletedAt: null },
        });
      if (storeExists)
        throw new BadRequestException('이미 등록된 스마트스토어 입니다.');

      storeData.smartStoreCredentials = {
        create: {
          ...smartStoreCredentials,
          channelId: storeInfo.channelId,
          name: storeInfo.name,
        },
      };
    }

    try {
      const store = await this.prismaService.store.create({
        data: storeData,
        include: { smartStoreCredentials: true },
      });

      return store;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 생성하는데 실패하였습니다.',
      );
    }
  }

  public async update(
    workspaceId: number,
    storeId: number,
    updateStoreDto: UpdateStoreDto,
  ) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    const { smartStoreCredentials, ...rest } = updateStoreDto;
    const updateData: Prisma.StoreUpdateInput = { ...rest };

    if (smartStoreCredentials && store.smartStoreCredentials) {
      const { applicationId, applicationSecret } = smartStoreCredentials;
      const storeInfo = await this.ncommerceService.getStoreInfo(
        applicationId,
        applicationSecret,
      );
      if (storeInfo.channelId !== store.smartStoreCredentials.channelId)
        throw new BadRequestException(
          '변경하려는 스마트스토어 정보가 일치하지 않습니다.',
        );

      updateData.smartStoreCredentials = {
        update: { ...smartStoreCredentials },
      };
    }

    try {
      const updatedStore = await this.prismaService.store.update({
        where: { id: storeId },
        data: updateData,
        include: { smartStoreCredentials: true },
      });

      return updatedStore;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 수정하는데 실패하였습니다.',
      );
    }
  }

  public async delete(workspaceId: number, storeId: number) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    try {
      const deletedStore = await this.prismaService.store.update({
        where: { id: storeId },
        data: {
          deletedAt: new Date(),
          smartStoreCredentials: store.smartStoreCredentials
            ? { update: { deletedAt: new Date() } }
            : undefined,
        },
        include: { smartStoreCredentials: true },
      });

      return deletedStore;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '스토어 정보를 삭제하는데 실패하였습니다.',
      );
    }
  }

  public async syncProduct(workspaceId: number, storeId: number) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    if (store.type === StoreType.SMARTSTORE && store.smartStoreCredentials) {
      const { applicationId, applicationSecret } = store.smartStoreCredentials;

      try {
        const syncResponse = await this.ncommerceService.getProducts(
          applicationId,
          applicationSecret,
        );

        await this.prismaService.$transaction(
          syncResponse.map((product) => {
            const { originProductNo, channelProducts } = product;
            const productInfo = channelProducts.find(
              (channelProduct) =>
                channelProduct.originProductNo === originProductNo,
            );
            if (!productInfo) return;

            const {
              name,
              representativeImage: { url },
            } = productInfo;
            return this.prismaService.product.upsert({
              where: {
                productId_storeId: {
                  productId: originProductNo.toString(),
                  storeId: storeId,
                },
              },
              create: {
                workspace: { connect: { id: workspaceId } },
                productId: originProductNo.toString(),
                store: { connect: { id: storeId } },
                name,
                productImage: url,
              },
              update: {
                name,
                productImage: url,
              },
            });
          }),
        );

        await this.prismaService.store.update({
          where: { id: storeId },
          data: { lastProductSyncAt: new Date() },
        });
      } catch (error) {
        if (error.status) throw error;

        throw new InternalServerErrorException(
          '스토어 정보를 동기화하는데 실패하였습니다.',
        );
      }
    } else {
      throw new BadRequestException(
        '스마트스토어 타입의 스토어만 동기화 가능합니다.',
      );
    }
  }

  public async syncOption(
    workspaceId: number,
    storeId: number,
    productId: number,
  ) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('상품 정보를 찾을 수 없습니다.');

    if (store.type === StoreType.SMARTSTORE && store.smartStoreCredentials) {
      const { applicationId, applicationSecret } = store.smartStoreCredentials;

      try {
        const syncResponse = await this.ncommerceService.getProductOptions(
          applicationId,
          applicationSecret,
          product.productId,
        );

        await this.prismaService.$transaction(
          syncResponse.map((option) => {
            const { id, name } = option;
            return this.prismaService.productVariant.upsert({
              where: {
                variantId_productId: {
                  variantId: id.toString(),
                  productId: product.id,
                },
              },
              create: {
                product: { connect: { id: product.id } },
                variantId: id.toString(),
                name,
              },
              update: {
                variantId: id.toString(),
                name,
              },
            });
          }),
        );
      } catch (error) {
        if (error.status) throw error;

        throw new InternalServerErrorException(
          '상품 옵션을 동기화하는데 실패하였습니다.',
        );
      }
    } else {
      throw new BadRequestException(
        '스마트스토어 타입의 스토어만 동기화 가능합니다.',
      );
    }
  }

  public async updateStoreLastSyncedAt(storeId: number, lastOrderSyncAt: Date) {
    return this.prismaService.store.update({
      where: { id: storeId },
      data: { lastOrderSyncAt },
    });
  }
}
