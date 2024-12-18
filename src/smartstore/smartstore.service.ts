import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ProductResponse } from './interfaces/products.interface';
import { ProductDetails } from './interfaces/product.interface';
import { isAxiosError } from 'axios';
import { KakaoService } from 'src/kakao/kakao.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { differenceInMinutes } from 'date-fns';
import { CreateProductInterface } from 'src/store/interface/create-product.interface';

@Injectable()
export class SmartstoreService {
  private readonly logger: Logger = new Logger(SmartstoreService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly kakaoService: KakaoService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  private async handleCommerceError(error: unknown, applicationId: string) {
    if (!isAxiosError(error)) return;
    if (error?.response?.status !== 401) return;

    await this.prismaService.store.updateMany({
      where: { smartStoreCredentials: { applicationId } },
      data: {
        enabled: false,
      },
    });
  }

  public async completeDelivery(
    applicationId: string,
    applicationSecret: string,
    productOrderIds: string[],
  ) {
    const accessToken = await this.findAccessToken(
      applicationId,
      applicationSecret,
    );

    const removedDuplicatedProductOrderIds = [...new Set(productOrderIds)];

    try {
      const dispatchResponse = await firstValueFrom(
        this.httpService.post(
          '/v1/pay-order/seller/product-orders/dispatch',
          {
            dispatchProductOrders: removedDuplicatedProductOrderIds.map(
              (productOrderId) => ({
                productOrderId,
                deliveryMethod: 'DIRECT_DELIVERY',
                dispatchDate: new Date().toISOString(),
              }),
            ),
          },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ),
      );

      return dispatchResponse.data;
    } catch (error) {
      await this.handleCommerceError(error, applicationId);
      this.logger.error(error, error.response.data);
      throw error;
    }
  }

  public async getProductOptions(
    applicationId: string,
    applicationSecret: string,
    productId: string,
  ) {
    const accessToken = await this.findAccessToken(
      applicationId,
      applicationSecret,
    );
    try {
      const channelResponse = await firstValueFrom(
        this.httpService.get<ProductDetails>(
          `/v2/products/origin-products/${productId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      const product = channelResponse.data;
      if (!product.originProduct.detailAttribute.optionInfo.optionCombinations)
        throw new NotFoundException('옵션 정보가 없습니다.');

      const options =
        product.originProduct.detailAttribute.optionInfo.optionCombinations.map(
          (option) => {
            const { id, optionName1, optionName2, optionName3, optionName4 } =
              option;
            const name = [optionName1, optionName2, optionName3, optionName4]
              .filter(Boolean)
              .join(' > ');

            return { id, name };
          },
        );

      return options;
    } catch (error) {
      await this.handleCommerceError(error, applicationId);
      this.logger.error(error);
      if (isAxiosError(error)) {
        throw new InternalServerErrorException(
          '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
        );
      }

      throw error;
    }
  }

  public async getProducts(
    applicationId: string,
    applicationSecret: string,
  ): Promise<CreateProductInterface[]> {
    const accessToken = await this.findAccessToken(
      applicationId,
      applicationSecret,
    );

    try {
      const size = 500; // 고정 사이즈
      let page = 0;
      let totalPages = 0;
      const allProducts: Content[] = [];

      do {
        const channelResponse = await firstValueFrom(
          this.httpService.post<ProductResponse>(
            '/v1/products/search',
            { size, page: page + 1 },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        const responseData = channelResponse.data;
        allProducts.push(...responseData.contents);
        totalPages = responseData.totalPages;
        page++;
      } while (page < totalPages);

      return allProducts
        .map((product) => {
          const { originProductNo, channelProducts } = product;
          const productInfo = channelProducts.find(
            (channelProduct) =>
              channelProduct.originProductNo === originProductNo,
          );
          if (!productInfo) return;

          return {
            productId: originProductNo.toString(),
            name: productInfo.name,
            productImageUrl: productInfo.representativeImage.url,
          };
        })
        .filter((item) => item !== undefined);
    } catch (error) {
      await this.handleCommerceError(error, applicationId);
      this.logger.error(error);
      throw new InternalServerErrorException(
        '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
      );
    }
  }

  public async getStoreInfo(applicationId: string, applicationSecret: string) {
    const accessToken = await this.findAccessToken(
      applicationId,
      applicationSecret,
    );

    try {
      const channelResponse = await firstValueFrom(
        this.httpService.get(`/v1/seller/channels`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
      const channelData = channelResponse.data;
      if (channelData.length === 0)
        throw new BadRequestException('채널 정보를 찾을 수 없습니다.');

      const { channelNo, name, url } = channelData[0];
      return {
        channelId: channelNo,
        name,
        url,
      };
    } catch (error) {
      await this.handleCommerceError(error, applicationId);
      this.logger.error(error);
      if (isAxiosError(error))
        throw new InternalServerErrorException(
          '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
        );

      throw error;
    }
  }

  public async findAccessToken(
    applicationId: string,
    applicationSecret: string,
  ) {
    try {
      const cachedToken = await this.prismaService.smartStoreToken.findUnique({
        where: {
          applicationId_applicationSecret: {
            applicationId,
            applicationSecret,
          },
        },
      });

      if (
        cachedToken?.expiresAt &&
        cachedToken.accessToken &&
        differenceInMinutes(cachedToken.expiresAt, new Date()) > 10
      )
        return cachedToken.accessToken;

      const timestamp = new Date().getTime();
      const hashToken = this.hashToken(
        applicationId,
        applicationSecret,
        timestamp,
      );

      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          '/v1/oauth2/token',
          {
            grant_type: 'client_credentials',
            client_secret_sign: hashToken,
            client_id: applicationId,
            timestamp,
            type: 'SELF',
          },
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      const { access_token, expires_in } = tokenResponse.data;
      try {
        await this.prismaService.smartStoreToken.upsert({
          where: {
            applicationId_applicationSecret: {
              applicationId,
              applicationSecret,
            },
          },
          update: {
            accessToken: access_token,
            expiresAt: new Date(new Date().getTime() + expires_in * 1000),
          },
          create: {
            applicationId,
            applicationSecret,
            accessToken: access_token,
            expiresAt: new Date(new Date().getTime() + expires_in * 1000),
          },
        });
      } catch (error) {
        this.logger.error('redis', error);
      }

      return access_token;
    } catch (error) {
      await this.handleCommerceError(error, applicationId);
      this.logger.error(error);
      if (!isAxiosError(error)) {
        throw new InternalServerErrorException(
          '일시적인 문제가 발생하였습니다. 네이버 커머스 권한 정보를 확인하세요.',
        );
      }
      if (error?.response?.status === 500)
        throw new InternalServerErrorException(
          '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
        );
      if (error?.response?.status === 403) {
        await this.expiredSmartstoreToken(
          applicationId,
          '유효하지 않은 인증 정보 입니다. 새로운 인증 정보를 등록해주세요.',
        );
        throw new ForbiddenException('유효하지 않는 접근 권한입니다.');
      }

      if (error?.response?.status === 400) {
        await this.expiredSmartstoreToken(
          applicationId,
          '잘못된 요청입니다. 고객센터에 문의해주세요.',
        );
        throw new BadRequestException('잘못된 요청입니다.');
      }

      throw new InternalServerErrorException(
        '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
      );
    }
  }

  private async expiredSmartstoreToken(applicationId: string, reason: string) {
    if (!applicationId)
      throw new BadRequestException('applicationId를 찾을 수 없습니다.');

    const targetStores = await this.prismaService.store.findMany({
      where: {
        smartStoreCredentials: { applicationId },
        deletedAt: null,
        enabled: true,
      },
    });
    if (targetStores.length === 0) return;

    try {
      const messages = await Promise.all(
        targetStores.map(async (message) => {
          const targetWorkspace =
            await this.workspaceService.getWorkspaceOwners(message.workspaceId);
          if (!targetWorkspace) return;

          return targetWorkspace.workspaceUser.map(({ user }) => {
            return {
              to: user.phone,
              templateId: 'KA01TP241103083701188oSf6ZShyoQ2',
              variables: {
                '#{고객명}': user.name,
                '#{사유}': reason,
              },
            };
          });
        }),
      );

      await this.kakaoService.sendKakaoMessage(
        messages.flat().filter((item) => item !== undefined),
      );
    } catch (error) {
      this.logger.error(error);
    }

    await this.prismaService.store.updateMany({
      where: { smartStoreCredentials: { applicationId } },
      data: {
        enabled: false,
      },
    });
  }

  private hashToken(
    applicationId: string,
    applicationSecret: string,
    timestamp: number,
  ) {
    const hashed = hashSync(`${applicationId}_${timestamp}`, applicationSecret);

    return Buffer.from(hashed).toString('base64');
  }
}
