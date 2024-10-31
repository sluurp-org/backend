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
  KakaoAlimtalkTemplateMessageType,
  SolapiMessageService,
  UpdateKakaoAlimtalkTemplateRequest,
} from 'solapi';
import { createHmac, randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestChannelTokenBodyDto } from './dto/req/request-channel-token-body.dto';
import { ConnectChannelBodyDto } from './dto/req/connect-channel-body.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import sizeOf from 'image-size';

@Injectable()
export class KakaoService {
  private logger: Logger = new Logger('KakaoService');
  private solapiMessageService: SolapiMessageService;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {
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

  public async getKakaoMessageCategories() {
    return this.solapiMessageService.getKakaoAlimtalkTemplateCategories();
  }

  public async getKakaoCategories() {
    return this.solapiMessageService.getKakaoChannelCategories();
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
    return this.solapiMessageService.getKakaoChannelCategories();
  }

  public async requestKakaoChannelToken(dto: RequestChannelTokenBodyDto) {
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

  private async templateGroupInvite(channelId: string) {
    const SOLAPI_CHANNEL_GROUP_ID = this.configService.get<string>(
      'SOLAPI_CHANNEL_GROUP_ID',
    );

    const createInviteResult = await firstValueFrom(
      this.httpService.post(
        `/kakao/v2/channel-groups/invitations/${SOLAPI_CHANNEL_GROUP_ID}`,
        {
          channelId,
        },
        {
          headers: {
            Authorization: this.generateAccessToken(),
          },
        },
      ),
    );
    if (!createInviteResult.data.invitationId)
      throw new InternalServerErrorException(
        '카카오 템플릿 그룹 초대에 실패했습니다.',
      );

    const acceptInviteResult = await firstValueFrom(
      this.httpService.post(
        `/kakao/v2/channel-groups/invitations/${createInviteResult.data.invitationId}/accept`,
        {},
        {
          headers: {
            Authorization: this.generateAccessToken(),
          },
        },
      ),
    );
    if (acceptInviteResult.data.status !== 'ACCEPTED')
      throw new InternalServerErrorException(
        '카카오 템플릿 그룹 초대 수락에 실패했습니다.',
      );

    return true;
  }

  public async connectKakaoChannel(
    workspaceId: number,
    dto: ConnectChannelBodyDto,
  ) {
    const kakaoCredential = await this.prismaService.kakaoCredential.findUnique(
      { where: { workspaceId } },
    );
    if (kakaoCredential)
      throw new BadRequestException('이미 카카오 채널이 연동되어 있습니다');

    const kakaoCredentialBySearchId =
      await this.prismaService.kakaoCredential.findUnique({
        where: { searchId: dto.searchId },
      });
    if (kakaoCredentialBySearchId)
      throw new BadRequestException(
        '이미 다른 스토어와 카카오 채널이 연동되어 있습니다',
      );

    try {
      const connectChannelResult =
        await this.solapiMessageService.createKakaoChannel(dto);

      await this.templateGroupInvite(connectChannelResult.channelId);

      const { channelId, searchId } = connectChannelResult;
      return this.prismaService.kakaoCredential.create({
        data: {
          workspaceId,
          channelId,
          searchId,
        },
      });
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 채널 연동에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async createKakaoTemplate(
    dto: Pick<
      CreateKakaoAlimtalkTemplateRequest,
      | 'name'
      | 'content'
      | 'categoryCode'
      | 'buttons'
      | 'quickReplies'
      | 'extra'
      | 'imageId'
    >,
  ) {
    const channelGroupId = this.configService.get<string>(
      'SOLAPI_CHANNEL_GROUP_ID',
    );
    const { imageId } = dto;

    try {
      const createTemplateResult =
        await this.solapiMessageService.createKakaoAlimtalkTemplate({
          ...dto,
          channelGroupId,
          emphasizeType: imageId ? 'IMAGE' : 'NONE',
          messageType: this.getMessageType(dto),
        });

      return createTemplateResult;
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 템플릿 생성에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async updateKakaoTemplate(
    templateId: string,
    dto: UpdateKakaoAlimtalkTemplateRequest,
  ) {
    const { imageId } = dto;
    try {
      const createTemplateResult =
        await this.solapiMessageService.updateKakaoAlimtalkTemplate(
          templateId,
          {
            ...dto,
            emphasizeType: imageId ? 'IMAGE' : 'NONE',
            messageType: this.getMessageType(dto),
          },
        );

      return createTemplateResult;
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 템플릿 생성에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  private getMessageType(
    dto:
      | CreateKakaoAlimtalkTemplateRequest
      | UpdateKakaoAlimtalkTemplateRequest,
  ) {
    let messageType: KakaoAlimtalkTemplateMessageType = 'BA';

    const isChannelAddButton = !!dto.buttons.find(
      (item) => item.buttonType === 'AC',
    );

    if (isChannelAddButton && dto.extra) {
      messageType = 'MI';
    } else if (isChannelAddButton) {
      messageType = 'AD';
    } else if (dto.extra) {
      messageType = 'EX';
    }

    return messageType;
  }

  public async requestKakaoTemplateInspection(templateId: string) {
    try {
      return await this.solapiMessageService.requestInspectionKakaoAlimtalkTemplate(
        templateId,
      );
    } catch (error) {
      this.logger.error(error);
      const message =
        error.message || '카카오 템플릿 검수 요청에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async cancelKakaoTemplateInspection(templateId: string) {
    try {
      return await this.solapiMessageService.cancelInspectionKakaoAlimtalkTemplate(
        templateId,
      );
    } catch (error) {
      this.logger.error(error);
      const message =
        error.message || '카카오 템플릿 검수 취소에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async deleteKakaoTemplate(templateId: string) {
    try {
      const template = await this.getKakaoTemplate(templateId);
      if (template.status === 'INSPECTING')
        await this.cancelKakaoTemplateInspection(templateId); // 검수 취소

      return await this.solapiMessageService.removeKakaoAlimtalkTemplate(
        templateId,
      );
    } catch (error) {
      this.logger.error(error);
      const message = error.message || '카카오 템플릿 삭제에 실패했습니다.';
      throw new InternalServerErrorException(message);
    }
  }

  public async findWorkspaceKakao(workspaceId: number) {
    const kakaoCredential = await this.prismaService.kakaoCredential.findUnique(
      { where: { workspaceId } },
    );
    if (!kakaoCredential)
      throw new NotFoundException('카카오 채널 연동이 필요합니다.');

    return kakaoCredential;
  }

  public async deleteKakaoChannel(workspaceId: number) {
    const kakaoCredential = await this.prismaService.kakaoCredential.findUnique(
      { where: { workspaceId } },
    );
    if (!kakaoCredential)
      throw new NotFoundException('카카오 채널 연동이 필요합니다.');

    return await this.prismaService.$transaction(async (tx) => {
      try {
        await this.solapiMessageService.removeKakaoChannel(
          kakaoCredential.channelId,
        );
      } catch (error) {
        this.logger.error(error);
      }

      await tx.messageTemplate.deleteMany({
        where: {
          workspaceId,
        },
      });

      return tx.kakaoCredential.delete({
        where: { id: kakaoCredential.id },
      });
    });
  }

  public async uploadKakaoImage(file: Express.Multer.File) {
    // file is 2:1 ratio and file size is less than 500KB
    if (file.size > 500 * 1024)
      throw new BadRequestException(
        '이미지 파일 크기는 500KB 이하여야 합니다.',
      );

    const dimensions = sizeOf(file.buffer);
    if (dimensions.width / dimensions.height !== 2)
      throw new BadRequestException('이미지 파일 비율이 2:1이 아닙니다.');

    // 이미지 파일인지 확인
    if (!file || !file.mimetype.startsWith('image/'))
      throw new BadRequestException('이미지 파일이 아닙니다.');
    const base64 = file.buffer.toString('base64');

    const accessToken = this.generateAccessToken();
    try {
      // https://developers.solapi.com/references/storage/uploadFile
      const response = await firstValueFrom(
        this.httpService.post(
          '/storage/v1/files',
          { file: base64, type: 'ATA' },
          {
            headers: {
              Authorization: accessToken,
            },
          },
        ),
      );

      if (response.status !== 200)
        throw new InternalServerErrorException('이미지 업로드에 실패했습니다.');

      const { url, fileId } = response.data;
      return {
        url,
        fileId,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('이미지 업로드에 실패했습니다.');
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
