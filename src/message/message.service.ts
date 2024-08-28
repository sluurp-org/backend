import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoService } from 'src/kakao/kakao.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageTemplateType, Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  private readonly logger: Logger = new Logger(MessageService.name);
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly prismaService: PrismaService,
  ) {}

  public async createMessage(
    workspaceId: number,
    createMessageDto: CreateMessageDto,
  ) {
    const { name, type, kakaoTemplate, ...rest } = createMessageDto;

    const createMessage: Prisma.MessageTemplateCreateInput = {
      workspace: { connect: { id: workspaceId } },
      ...rest,
      name,
      type,
    };

    if (type === MessageTemplateType.KAKAO) {
      const kakaoCredential =
        await this.prismaService.kakaoCredential.findUnique({
          where: { workspaceId },
        });
      if (!kakaoCredential)
        throw new NotAcceptableException('카카오 인증 정보를 등록해주세요.');

      // const test = await this.kakaoService.createKakaoTemplate({
      //   name,
      //   ...kakaoTemplate,
      // buttons: kakaoTemplate.buttons.map((button) => {
      //   const { name, type, url } = button;
      //   if (type === KakaoButtonType.PR)
      //     return {
      //       buttonName: name,
      //       buttonType: 'WL',
      //       linkMo: url,
      //       linkPc: url,
      //     };

      //   return {
      //     buttonName: button.name,
      //     buttonType: 'WL',
      //     linkMo: button.url,
      //     linkPc: button.url,
      //   };
      // }),
      // quickReplies: kakaoTemplate.quickReplies.map((quickReply) => ({
      //   name: quickReply.name,
      //   linkType: quickReply.type,
      //   linkMo: quickReply.url,
      //   linkPc: quickReply.url,
      // })
      // });

      // const template = await this.kakaoService.getKakaoTemplate(
      // kakaoTemplate.templateId,
      // );
      // if (!template) throw new NotFoundException('템플릿을 찾을 수 없습니다.');

      // createMessage.kakaoTemplate = {
      //   create: {
      //     ...kakaoTemplate,
      //     credential: { connect: { id: kakaoCredential.id } },
      //   },
      // };
    }

    try {
      return await this.prismaService.messageTemplate.create({
        data: createMessage,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '메시지 템플릿을 생성할 수 없습니다.',
      );
    }
  }
}
