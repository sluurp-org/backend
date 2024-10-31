import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, StoreType, SubscriptionModel } from '@prisma/client';
import { FindStoreQueryDto } from './dto/req/find-store-query.dto';
import { CreateStoreBodyDto } from './dto/req/create-store-body.dto';
import { UpdateStoreBodyDto } from './dto/req/update-store-body.dto';
import { SmartstoreService } from 'src/smartstore/smartstore.service';
import { StoreDto } from './dto/res/store.dto';
import { SqsService } from '@ssut/nestjs-sqs';
import { differenceInMinutes, isSameHour } from 'date-fns';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  constructor(
    private readonly sqsService: SqsService,
    private readonly prismaService: PrismaService,
    private readonly smartstoreService: SmartstoreService,
  ) {}

  public async findMany(workspaceId: number, findStoreDto: FindStoreQueryDto) {
    const { type, enabled, name, skip, take } = findStoreDto;
    return this.prismaService.store.findMany({
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
  }

  public async count(workspaceId: number, findStoreDto: FindStoreQueryDto) {
    const { type, enabled, name } = findStoreDto;
    return this.prismaService.store.count({
      where: {
        workspaceId,
        deletedAt: null,
        type,
        enabled,
        name: name && { contains: name },
      },
    });
  }

  public async findOne(
    storeId: number,
    workspaceId: number,
  ): Promise<StoreDto> {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    return store;
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

  private async checkStoreLimit(
    workspaceId: number,
    workspaceSubscription?: SubscriptionModel,
  ) {
    if (!workspaceSubscription)
      throw new BadRequestException(
        '스토어를 생성하기 위해 먼저 워크스페이스 구독이 필요합니다.',
      );

    const storeCount = await this.prismaService.store.count({
      where: { workspaceId },
    });

    const { storeLimit } = workspaceSubscription;

    if (storeCount >= storeLimit && storeLimit !== 0)
      throw new BadRequestException(
        `스토어 생성 가능 개수를 초과하였습니다. 최대 ${storeLimit}개까지 생성 가능합니다.`,
      );
  }

  public async create(
    workspaceId: number,
    createStoreBodyDto: CreateStoreBodyDto,
    workspaceSubscription?: SubscriptionModel,
  ) {
    const { type, smartStoreCredentials, ...rest } = createStoreBodyDto;
    await this.checkStoreLimit(workspaceId, workspaceSubscription);

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

      const storeInfo = await this.smartstoreService.getStoreInfo(
        applicationId,
        applicationSecret,
      );

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
    updateStoreDto: UpdateStoreBodyDto,
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
      const storeInfo = await this.smartstoreService.getStoreInfo(
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

    return await this.prismaService.$transaction(async (tx) => {
      const deletedStore = await tx.store.update({
        where: { id: storeId },
        data: {
          deletedAt: new Date(),
        },
        include: { smartStoreCredentials: true },
      });

      await tx.smartStoreCredentials.delete({
        where: { id: store.smartStoreCredentials.id },
      });

      return deletedStore;
    });
  }

  public async syncProduct(workspaceId: number, storeId: number) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    if (
      store.lastProductSyncAt &&
      differenceInMinutes(new Date(), store.lastProductSyncAt) < 10
    ) {
      const leftMinutes = differenceInMinutes(
        new Date(),
        store.lastProductSyncAt,
      );
      throw new BadRequestException(
        `최근 동기화 시간이 ${leftMinutes}분 이내입니다. ${leftMinutes}분 뒤에 다시 시도해주세요.`,
      );
    }

    if (store.type === StoreType.SMARTSTORE && store.smartStoreCredentials) {
      const { applicationId, applicationSecret } = store.smartStoreCredentials;

      try {
        const syncResponse = await this.smartstoreService.getProducts(
          applicationId,
          applicationSecret,
        );

        return await this.prismaService.$transaction(async (tx) => {
          await Promise.all(
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
              return tx.product.upsert({
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

          return await tx.store.update({
            where: { id: storeId },
            data: { lastProductSyncAt: new Date() },
          });
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

  public async syncOption(workspaceId: number, productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
        store: { workspaceId },
      },
      include: {
        store: {
          include: { smartStoreCredentials: true },
        },
      },
    });
    if (!product) throw new NotFoundException('상품 정보를 찾을 수 없습니다.');

    if (
      product.store.type === StoreType.SMARTSTORE &&
      product.store.smartStoreCredentials
    ) {
      const { applicationId, applicationSecret } =
        product.store.smartStoreCredentials;

      try {
        const syncResponse = await this.smartstoreService.getProductOptions(
          applicationId,
          applicationSecret,
          product.productId,
        );

        await this.prismaService.$transaction(async (tx) => {
          return await Promise.all(
            syncResponse.map((option) => {
              const { id, name } = option;
              return tx.productVariant.upsert({
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
        });
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

  public async sendStoreToSqs() {
    const stores = await this.prismaService.store.findMany({
      where: {
        enabled: true,
        readonly: false,
        type: StoreType.SMARTSTORE,
        smartStoreCredentials: {
          isNot: null,
        },
      },
      include: { smartStoreCredentials: true },
    });

    const sqsPayload = stores.map((store) => ({
      id: store.id.toString() + new Date().getTime().toString(),
      body: JSON.stringify({
        payload: {
          applicationId: store.smartStoreCredentials.applicationId,
          applicationSecret: store.smartStoreCredentials.applicationSecret,
          emailParseable: store.smartStoreCredentials.emailParseable,
        },
        lastSyncedAt: store.lastOrderSyncAt,
        provider: 'SMARTSTORE',
        storeId: store.id,
      }),
    }));

    console.log(`Sending ${sqsPayload.length} messages to SQS`);
    await this.sqsService.send('commerce', sqsPayload);
    console.log('Messages sent to SQS');
  }
}
