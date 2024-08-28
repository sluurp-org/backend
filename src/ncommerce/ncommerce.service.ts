import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ProductResponse } from './interfaces/products.interface';
import { ProductDetails } from './interfaces/product.interface';
import { isAxiosError } from 'axios';

@Injectable()
export class NcommerceService {
  private readonly logger: Logger = new Logger(NcommerceService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getProductOptions(
    applicationId: string,
    applicationSecret: string,
    productId: string,
  ) {
    const accessToken = await this.getAccessToken(
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
  ): Promise<Content[]> {
    const accessToken = await this.getAccessToken(
      applicationId,
      applicationSecret,
    );

    try {
      const size = 500; // 고정 사이즈
      let page = 0;
      let totalPages = 0;
      const allProducts = [];

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

      return allProducts;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
      );
    }
  }

  public async getStoreInfo(applicationId: string, applicationSecret: string) {
    const accessToken = await this.getAccessToken(
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
      if (isAxiosError(error))
        throw new InternalServerErrorException(
          '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
        );

      throw error;
    }
  }

  public async getAccessToken(
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
      if (cachedToken && cachedToken.expiresAt > new Date()) {
        const isValid = await this.validateToken(cachedToken.accessToken);
        if (isValid) return cachedToken.accessToken;
      }

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
      if (isAxiosError(error))
        throw new InternalServerErrorException(
          '정상적이지 않은 토큰입니다. 확인 후 다시 시도해주세요.',
        );

      if (error.response.status === 500)
        throw new InternalServerErrorException(
          '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
        );
      if (error.response.status === 403)
        throw new ForbiddenException('유효하지 않는 접근 권한입니다.');

      if (error.response.status === 400)
        throw new BadRequestException('유효하지 않은 입력 정보입니다.');

      throw new InternalServerErrorException(
        '네이버 커머스 서버에서 오류가 발생했습니다. 잠시만 기다려주세요.',
      );
    }
  }

  private hashToken(
    applicationId: string,
    applicationSecret: string,
    timestamp: number,
  ) {
    const hashed = hashSync(`${applicationId}_${timestamp}`, applicationSecret);

    return Buffer.from(hashed).toString('base64');
  }

  private async validateToken(token: string): Promise<boolean> {
    if (!token) throw new BadRequestException('토큰이 필요합니다.');

    try {
      await this.httpService.get('/v1/seller/account', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
