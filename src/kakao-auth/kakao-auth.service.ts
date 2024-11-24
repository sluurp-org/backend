import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KakaoAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private apiURL = this.configService.getOrThrow<string>('KAKAO_API_URL');
  private authURL = this.configService.getOrThrow<string>('KAKAO_AUTH_URL');
  private clientId = this.configService.getOrThrow<string>('KAKAO_CLIENT_ID');
  private callbackUrl =
    this.configService.getOrThrow<string>('KAKAO_CALLBACK_URL');

  public getAuthorizationUrl() {
    const url = new URL(this.authURL + '/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('redirect_uri', this.callbackUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('scope', 'name,phone_number');

    return url.toString();
  }

  public async getProfile(code: string) {
    try {
      const token = await firstValueFrom(
        this.httpService.get(`${this.authURL}/token`, {
          params: {
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: this.callbackUrl,
            code,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const accessToken = token.data.access_token;
      const profile = await firstValueFrom(
        this.httpService.get(`${this.apiURL}/user/me`, {
          params: {
            property_keys: ['kakao_account.profile', 'kakao_account.name'],
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }),
      );

      const {
        id,
        kakao_account: { name, phone_number },
      } = profile.data;

      const providerId: string = id.toString();
      const mobile = phone_number
        .replaceAll('-', '')
        .replace('+82', '0')
        .replace(' ', '');

      return { id: providerId, name, mobile };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('네이버 로그인에 실패했습니다.');
    }
  }
}
