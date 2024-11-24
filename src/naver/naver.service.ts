import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NaverService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private state = 'sluurp';
  private apiURL = this.configService.getOrThrow<string>('NAVER_API_URL');
  private clientId = this.configService.getOrThrow<string>('NAVER_CLIENT_ID');
  private clientSecret = this.configService.getOrThrow<string>(
    'NAVER_CLIENT_SECRET',
  );
  private callbackUrl =
    this.configService.getOrThrow<string>('NAVER_CALLBACK_URL');

  public getAuthorizationUrl() {
    const url = new URL(this.apiURL + '/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.callbackUrl);
    url.searchParams.append('state', this.state);

    return url.toString();
  }

  public async getProfile(code: string) {
    try {
      const token = await firstValueFrom(
        this.httpService.get('/token', {
          params: {
            grant_type: 'authorization_code',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.callbackUrl,
            code,
            state: this.state,
          },
          headers: {
            'X-Naver-Client-Id': this.clientId,
            'X-Naver-Client-Secret': this.clientSecret,
          },
        }),
      );

      const accessToken = token.data.access_token;
      const profile = await firstValueFrom(
        this.httpService.get('https://openapi.naver.com/v1/nid/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const { id, name, mobile } = profile.data.response;
      return { id, name, mobile: mobile.replaceAll('-', '') };
    } catch (error) {
      throw new InternalServerErrorException('네이버 로그인에 실패했습니다.');
    }
  }
}
