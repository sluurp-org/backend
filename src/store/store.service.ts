import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  SmartPlaceCredentials,
  SmartStoreCredentials,
  StoreType,
} from '@prisma/client';
import { FindStoreQueryDto } from './dto/req/find-store-query.dto';
import { CreateStoreBodyDto } from './dto/req/create-store-body.dto';
import { UpdateStoreBodyDto } from './dto/req/update-store-body.dto';
import { SmartstoreService } from 'src/smartstore/smartstore.service';
import { SqsService } from '@ssut/nestjs-sqs';
import { differenceInMinutes } from 'date-fns';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { KakaoService } from 'src/kakao/kakao.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SmartplaceService } from 'src/smartplace/smartplace.service';
import { CreateProductInterface } from './interface/create-product.interface';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  constructor(
    private readonly sqsService: SqsService,
    private readonly prismaService: PrismaService,
    private readonly smartstoreService: SmartstoreService,
    private readonly workspaceService: WorkspaceService,
    private readonly kakaoService: KakaoService,
    private readonly smartplaceService: SmartplaceService,
    private eventEmitter: EventEmitter2,
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

  public async findOne(storeId: number, workspaceId: number) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true, smartPlaceCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    return store;
  }

  public async findOneByWorkspaceId(workspaceId: number) {
    try {
      const stores = await this.prismaService.store.findMany({
        where: { workspaceId, deletedAt: null },
        include: { smartStoreCredentials: true, smartPlaceCredentials: true },
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
    const { type, smartStoreCredentials, smartPlaceCredentials, ...rest } =
      createStoreBodyDto;

    const storeData: Prisma.StoreCreateInput = {
      ...rest,
      type,
      workspace: { connect: { id: workspaceId } },
    };

    if (type === StoreType.SMARTSTORE && smartStoreCredentials) {
      const { applicationId, applicationSecret } = smartStoreCredentials;
      if (!applicationId && !applicationSecret)
        throw new BadRequestException(
          '애플리케이션 ID와 시크릿을 입력해주세요.',
        );

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
    } else if (type === StoreType.SMARTPLACE && smartPlaceCredentials) {
      const { username, password, channelId } = smartPlaceCredentials;

      const place = await this.smartplaceService.getStoreInfo(
        { username, password },
        channelId,
      );

      storeData.smartPlaceCredentials = {
        create: {
          name: place.name,
          username,
          password,
          channelId,
        },
      };
    } else {
      throw new BadRequestException();
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
      include: { smartStoreCredentials: true, smartPlaceCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    const { smartStoreCredentials, smartPlaceCredentials, ...rest } =
      updateStoreDto;
    const updateData: Prisma.StoreUpdateInput = { ...rest };

    if (smartStoreCredentials && store.smartStoreCredentials) {
      const { applicationId, applicationSecret } = smartStoreCredentials;
      if (!applicationId || !applicationSecret)
        throw new BadRequestException(
          '애플리케이션 ID와 시크릿을 입력해주세요.',
        );

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

    if (smartPlaceCredentials && store.smartPlaceCredentials) {
      const { username, password } = smartPlaceCredentials;
      if (!username || !password)
        throw new BadRequestException('잘못된 요청입니다.');

      await this.smartplaceService.getStoreInfo(
        { username, password },
        store.smartPlaceCredentials.channelId,
        false,
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
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    return await this.prismaService.$transaction(async (tx) => {
      const deletedStore = await tx.store.update({
        where: { id: storeId },
        data: {
          deletedAt: new Date(),
          enabled: false,
        },
        include: { smartStoreCredentials: true, smartPlaceCredentials: true },
      });

      deletedStore.smartStoreCredentials &&
        (await tx.smartStoreCredentials.delete({
          where: { id: deletedStore.smartStoreCredentials.id },
        }));

      deletedStore.smartPlaceCredentials &&
        (await tx.smartPlaceCredentials.delete({
          where: { id: deletedStore.smartPlaceCredentials.id },
        }));

      return deletedStore;
    });
  }

  public async requestSyncProduct(workspaceId: number, storeId: number) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');
    const LAST_SYNC_MINUTES = 5;

    if (
      store.lastProductSyncAt &&
      differenceInMinutes(new Date(), store.lastProductSyncAt) <
        LAST_SYNC_MINUTES
    ) {
      const leftMinutes = differenceInMinutes(
        new Date(),
        store.lastProductSyncAt,
      );
      throw new BadRequestException(
        `${LAST_SYNC_MINUTES - leftMinutes}분 뒤에 다시 시도해주세요.`,
      );
    }

    const emit = this.eventEmitter.emit('sync.product', {
      workspaceId,
      storeId,
    });

    if (!emit)
      throw new InternalServerErrorException(
        '동기화 요청을 처리하는데 실패하였습니다.',
      );

    await this.prismaService.store.update({
      where: { id: storeId },
      data: { lastProductSyncAt: new Date() },
    });
  }

  @OnEvent('sync.product')
  public async syncProduct(payload: { workspaceId: number; storeId: number }) {
    const { workspaceId, storeId } = payload;
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId, workspaceId, deletedAt: null },
      include: { smartStoreCredentials: true, smartPlaceCredentials: true },
    });
    if (!store) throw new NotFoundException('스토어 정보를 찾을 수 없습니다.');

    this.logger.log(`Syncing product for store ${store.name}(${storeId})`);

    try {
      const products: CreateProductInterface[] = [];
      if (store.type === StoreType.SMARTSTORE && store.smartStoreCredentials) {
        const { applicationId, applicationSecret } =
          store.smartStoreCredentials;

        const syncResponse = await this.smartstoreService.getProducts(
          applicationId,
          applicationSecret,
        );

        products.push(...syncResponse);
      }

      if (store.type === StoreType.SMARTPLACE && store.smartPlaceCredentials) {
        const { username, password, channelId } = store.smartPlaceCredentials;

        const syncResponse = await this.smartplaceService.getProducts(
          {
            username,
            password,
          },
          channelId,
        );

        products.push(...syncResponse);
      }

      await this.prismaService.$transaction(
        async (tx) => {
          await Promise.all(
            products.map((product) => {
              const { productId, productImageUrl, name } = product;
              return tx.product.upsert({
                where: {
                  productId_storeId: {
                    productId,
                    storeId,
                  },
                },
                create: {
                  workspace: { connect: { id: workspaceId } },
                  store: { connect: { id: storeId } },
                  productImageUrl,
                  productId,
                  name,
                },
                update: {
                  name,
                  productImageUrl,
                },
              });
            }),
          );

          return await tx.store.update({
            where: { id: storeId },
            data: { lastProductSyncAt: new Date() },
          });
        },
        {
          maxWait: 1000 * 60 * 5, // 5 minutes
          timeout: 1000 * 60 * 5, // 5 minutes
        },
      );

      const targetWorkspace =
        await this.workspaceService.getWorkspaceOwners(workspaceId);
      if (!targetWorkspace) return;

      await this.kakaoService.sendKakaoMessage(
        targetWorkspace.workspaceUser.map(({ user }) => ({
          to: user.phone,
          templateId: 'KA01TP241114020554861jj4CrtMO5V4',
          variables: {
            '#{고객명}': user.name,
            '#{워크스페이스아이디}': workspaceId.toString(),
            '#{워크스페이스명}': targetWorkspace.name,
            '#{스토어명}': store.name,
            '#{상품수}': products.length.toString(),
          },
        })),
      );

      this.logger.log(
        `Synced product for store ${store.name}(${storeId}), ${products.length} products`,
      );
    } catch (error) {
      if (error.status) throw error;

      const targetWorkspace =
        await this.workspaceService.getWorkspaceOwners(workspaceId);
      if (!targetWorkspace) return;

      await this.kakaoService.sendKakaoMessage(
        targetWorkspace.workspaceUser.map(({ user }) => ({
          to: user.phone,
          templateId: 'KA01TP24111402232076653Deeg7n5Ss',
          variables: {
            '#{고객명}': user.name,
            '#{워크스페이스아이디}': workspaceId.toString(),
            '#{워크스페이스명}': targetWorkspace.name,
            '#{스토어명}': store.name,
            '#{스토어아이디}': storeId.toString(),
          },
        })),
      );

      throw new InternalServerErrorException(
        '스토어 정보를 동기화하는데 실패하였습니다.',
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

  private generateSmartStorePayload(
    smartStoreCredentials: SmartStoreCredentials,
  ) {
    const { applicationId, applicationSecret, emailParseable } =
      smartStoreCredentials;

    return {
      payload: {
        applicationId,
        applicationSecret,
        emailParseable,
      },
      provider: 'SMARTSTORE',
    };
  }

  private generateSmartPlacePayload(
    smartPlaceCredentials: SmartPlaceCredentials,
  ) {
    const { username, password, channelId } = smartPlaceCredentials;

    return {
      payload: {
        username,
        password,
        channelId,
      },
      provider: 'SMARTPLACE',
    };
  }

  public async sendStoreToSqs() {
    const stores = await this.prismaService.store.findMany({
      where: {
        enabled: true,
        deletedAt: null,
        workspace: {
          deletedAt: null,
        },
      },
      include: { smartStoreCredentials: true, smartPlaceCredentials: true },
    });

    const sqsPayload = stores
      .map((store) => {
        if (
          store.type === StoreType.SMARTSTORE &&
          store.smartStoreCredentials
        ) {
          return {
            id: store.id.toString() + new Date().getTime().toString(),
            body: JSON.stringify({
              ...this.generateSmartStorePayload(store.smartStoreCredentials),
              lastSyncedAt: store.lastOrderSyncAt,
              storeId: store.id,
            }),
          };
        }

        if (
          store.type === StoreType.SMARTPLACE &&
          store.smartPlaceCredentials
        ) {
          return {
            id: store.id.toString() + new Date().getTime().toString(),
            body: JSON.stringify({
              ...this.generateSmartPlacePayload(store.smartPlaceCredentials),
              lastSyncedAt: store.lastOrderSyncAt,
              storeId: store.id,
            }),
          };
        }
      })
      .filter((payload) => !!payload);

    console.log(`Sending ${sqsPayload.length} messages to SQS`);
    await this.sqsService.send('commerce', sqsPayload);
    console.log('Messages sent to SQS');
  }
}
