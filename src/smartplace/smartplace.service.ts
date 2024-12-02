import { InvokeCommand } from '@aws-sdk/client-lambda';
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cheerio from 'cheerio';
import { CreateProductInterface } from 'src/store/interface/create-product.interface';

@Injectable()
export class SmartplaceService {
  private readonly logger: Logger = new Logger(SmartplaceService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private extractPreloadedState(html: string): any {
    const $ = cheerio.load(html);

    try {
      let body: object | null = null;
      $('script').each((_, el) => {
        const scriptContent = $(el).html();

        if (
          scriptContent &&
          scriptContent.includes('window.__PRELOADED_STATE__')
        ) {
          const jsonStartIndex = scriptContent.indexOf('{');
          const jsonEndIndex = scriptContent.lastIndexOf('}');

          if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            const jsonString = scriptContent
              .substring(jsonStartIndex, jsonEndIndex + 1)
              .replaceAll('undefined', 'null');

            body = JSON.parse(jsonString);
          }
        }
      });

      return body;
    } catch (error) {
      return null;
    }
  }

  public async getProducts(
    credential: { username: string; password: string },
    placeId: string,
  ): Promise<CreateProductInterface[]> {
    const { username, password } = credential;
    const cookie = await this.findCookie(username, password);

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://partner.booking.naver.com/bizes/${placeId}/biz-items`,
          {
            headers: {
              cookie,
            },
          },
        ),
      );

      const data = this.extractPreloadedState(response.data);
      if (!data)
        throw new InternalServerErrorException(
          '상품 정보를 불러올 수 없습니다',
        );

      return data.bizItems.map((item) => ({
        productId: item.bizItemId,
        productImageUrl: item.bizItemResources.length
          ? item.bizItemResources[0].resourceUrl
          : undefined,
        name: item.name,
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(error, error.stack);
      throw new InternalServerErrorException(
        '플레이스 상품 정보를 불러오는 도중 오류가 발생하였습니다.',
      );
    }
  }

  public async getStoreInfo(
    credential: { username: string; password: string },
    placeId: string,
    tokenCache: boolean = true,
  ) {
    const { username, password } = credential;
    const cookie = await this.findCookie(username, password, tokenCache);

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://partner.booking.naver.com/bizes/${placeId}/detail`,
          {
            headers: {
              cookie,
            },
          },
        ),
      );

      const data = this.extractPreloadedState(response.data);
      if (!data)
        throw new InternalServerErrorException('정보를 불러올 수 없습니다');

      const business = data.smartPlace.businesses
        .map((item) => item.bookingBusinesses)
        .flat()
        .find((item) => item.businessId === placeId);
      if (!business)
        throw new NotFoundException('찾을 수 없는 비즈니스 ID 입니다.');

      return {
        name: business.businessDisplayName,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(error, error.stack);
      throw new InternalServerErrorException(
        '플레이스 정보를 불러오는 도중 오류가 발생하였습니다.',
      );
    }
  }

  public async findCookie(
    username: string,
    password: string,
    tokenCache: boolean = true,
  ): Promise<string> {
    try {
      const cachedToken = await this.prismaService.smartPlaceCookie.findUnique({
        where: {
          username,
          expiresAt: { gt: new Date() },
        },
      });
      if (cachedToken && tokenCache)
        return (cachedToken.cookie as { name: string; value: string }[])
          .map((item) => `${item.name}=${item.value}`)
          .join(';');

      const command = new InvokeCommand({
        FunctionName: 'naver-login-serverless-prod-naver',
        Payload: JSON.stringify({
          username,
          password,
        }),
      });
      const { Payload } = await this.awsService.lambda.send(command);
      if (!Payload)
        throw new InternalServerErrorException('네이버 로그인 실패');

      const cookie = JSON.parse(Buffer.from(Payload).toString()) as {
        name: string;
        value: string;
        expires: number;
      }[];
      const authCookie = cookie.find((item) => item.name === 'NID_AUT');
      if (!authCookie)
        throw new InternalServerErrorException('네이버 로그인 실패');

      await this.prismaService.smartPlaceCookie.upsert({
        where: { username },
        create: {
          username,
          cookie,
          expiresAt: new Date(authCookie.expires * 1000),
        },
        update: {
          cookie,
          expiresAt: new Date(authCookie.expires * 1000),
        },
      });

      return cookie.map((item) => `${item.name}=${item.value}`).join(';');
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new InternalServerErrorException(
        '로그인에 실패하였습니다. 2단계 인증 또는 비밀번호를 확인해주세요.',
      );
    }
  }
}
