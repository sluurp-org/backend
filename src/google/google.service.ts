import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
  private clientSecret = this.configService.getOrThrow<string>(
    'GOOGLE_CLIENT_SECRET',
  );
  private callbackUrl = this.configService.getOrThrow<string>(
    'GOOGLE_CALLBACK_URL',
  );

  public getAuthorizationUrl() {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.callbackUrl);
    url.searchParams.append('scope', 'profile');

    return url.toString();
  }

  public async getProfile(code: string) {
    try {
      const tokenResponse = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', {
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        }),
      );

      const { id_token } = tokenResponse.data;

      const userInfoResponse = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
          params: { id_token },
        }),
      );

      const userInfo = userInfoResponse.data;
      const id = userInfo.sub;
      const name = userInfo.name;

      return { id, name };
    } catch (error) {
      throw new InternalServerErrorException('구글 로그인에 실패했습니다.');
    }
  }
}
