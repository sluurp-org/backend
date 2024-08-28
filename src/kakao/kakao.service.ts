import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateKakaoAlimtalkTemplateRequest,
  SolapiMessageService,
} from 'solapi';
import { RequestChannelTokenDto } from './dto/request-channel-token.dto';
import { ConnectChannelDto } from './dto/connect-channel.dto';
import { createHmac, randomBytes } from 'crypto';

@Injectable()
export class KakaoService {
  private logger: Logger = new Logger('KakaoService');
  private solapiMessageService: SolapiMessageService;

  constructor(private readonly configService: ConfigService) {
    this.provisionKakaoService();
  }

  private provisionKakaoService() {
    try {
      this.solapiMessageService = new SolapiMessageService(
        this.configService.get<string>('SOLAPI_API_KEY'),
        this.configService.get<string>('SOLAPI_API_SECRET'),
      );
      this.logger.log('Kakao Service is provisioned');
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async getKakaoTemplate(templateId: string) {
    try {
      return await this.solapiMessageService.getKakaoAlimtalkTemplate(
        templateId,
      );
    } catch (error) {
      if (error.name === 'TemplateNotFound')
        throw new NotFoundException('카카오 템플릿을 찾을 수 없습니다.');

      if (error.name === 'ValidationError')
        throw new BadRequestException('카카오 템플릿을 찾을 수 없습니다.');

      this.logger.error(error);
      throw new InternalServerErrorException(
        '카카오 템플릿 조회에 실패했습니다.',
      );
    }
  }

  public async getCategories() {
    try {
      return await this.solapiMessageService.getKakaoChannelCategories();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '카카오 채널 카테고리 조회에 실패했습니다.',
      );
    }
  }

  public async requestKakaoChannelToken(dto: RequestChannelTokenDto) {
    try {
      const requestTokenResult =
        await this.solapiMessageService.requestKakaoChannelToken(dto);

      if (!requestTokenResult.success)
        throw new InternalServerErrorException(
          '카카오 채널 토큰 요청에 실패했습니다.',
        );

      return requestTokenResult;
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 채널 토큰 요청에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async connectKakaoChannel(dto: ConnectChannelDto) {
    try {
      const connectChannelResult =
        await this.solapiMessageService.createKakaoChannel(dto);

      return connectChannelResult;
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 채널 연동에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async createKakaoTemplate(dto: CreateKakaoAlimtalkTemplateRequest) {
    try {
      const createTemplateResult =
        await this.solapiMessageService.createKakaoAlimtalkTemplate({
          ...dto,
        });

      return createTemplateResult;
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 템플릿 생성에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  private generateAccessToken(): string {
    const apiKey = this.configService.get<string>('SOLAPI_API_KEY');
    const apiSecret = this.configService.get<string>('SOLAPI_API_SECRET');

    const currentDate = new Date().toISOString();
    const saltLength = Math.floor(Math.random() * (64 - 12 + 1) + 12);
    const salt = randomBytes(saltLength).toString('hex');
    const hmac = createHmac('sha256', apiSecret);

    const signatureBody = `${currentDate}${salt}`;
    hmac.update(signatureBody);

    const signature = hmac.digest('hex');
    return `HMAC-SHA256 apiKey=${apiKey}, date=${currentDate}, salt=${salt}, signature=${signature}`;
  }
}
