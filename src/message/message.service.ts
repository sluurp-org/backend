import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoService } from 'src/kakao/kakao.service';
import { FindMessageQueryDto } from './dto/req/find-message-query.dto';
import {
  KakaoTemplate,
  KakaoTemplateStatus,
  Message,
  MessageSendType,
  MessageTarget,
  MessageType,
  Prisma,
} from '@prisma/client';
import {
  KakaoTemplateButton,
  KakaoTemplateButtonType,
} from './dto/req/subtemplate/create-kakao-template-body.dto';
import { KakaoButton, KakaoDefaultButton, KakaoWebButton } from 'solapi';
import { CreateMessageBodyDto } from './dto/req/create-message-body.dto';
import { UpdateMessageBodyDto } from './dto/req/update-message-body.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly prismaService: PrismaService,
  ) {}

  public findAllVariables() {
    return this.prismaService.variables.findMany();
  }

  public countVariables() {
    return this.prismaService.variables.count();
  }

  public async findAll(id: number, dto: FindMessageQueryDto) {
    const { name, take, skip } = dto;
    return this.prismaService.message.findMany({
      where: {
        OR: [
          { workspaceId: id, name: { contains: name } },
          { type: MessageType.GLOBAL },
        ],
      },
      orderBy: { id: 'desc' },
      take,
      skip,
    });
  }

  public async count(id: number, dto: FindMessageQueryDto) {
    const { name } = dto;
    return this.prismaService.message.count({
      where: { workspaceId: id, name: { contains: name } },
    });
  }

  public async findCustomKakaoTemplates() {
    return this.prismaService.kakaoTemplate.findMany({
      where: { isCustomAvailable: true },
    });
  }

  private async fetchFullyCustomKakaoTemplateComments(
    kakaoTemplate: KakaoTemplate,
  ): Promise<string[]> {
    const { templateId, status } = kakaoTemplate;
    const comments: string[] = [];

    if (status === KakaoTemplateStatus.REJECTED) {
      const kakaoTemplate =
        await this.kakaoService.getKakaoTemplate(templateId);

      comments.push(
        ...(kakaoTemplate.comments ?? [])
          .filter((c) => c.isAdmin)
          .map((c) => c.content),
      );
    }

    return comments;
  }

  public async findOne(id: number, messageId: number) {
    const message = await this.prismaService.message.findFirst({
      where: {
        OR: [
          { id: messageId, workspaceId: id },
          { id: messageId, type: MessageType.GLOBAL },
        ],
      },
      include: {
        kakaoTemplate: true,
        contentGroup: true,
      },
    });
    if (!message) throw new NotFoundException('메시지가 존재하지 않습니다.');

    if (message.sendType === MessageSendType.KAKAO) {
      if (!message.kakaoTemplate)
        throw new NotFoundException('메시지가 존재하지 않습니다.');

      return {
        ...message,
        kakaoTemplate: {
          ...message.kakaoTemplate,
          comments: await this.fetchFullyCustomKakaoTemplateComments(
            message.kakaoTemplate,
          ),
        },
      };
    }

    throw new BadRequestException('지원하지 않는 메시지 타입입니다.');
  }

  public async createMessage(workspaceId: number, dto: CreateMessageBodyDto) {
    const { type, target, sendType, customPhone, customEmail } = dto;

    if (target === MessageTarget.CUSTOM && !customPhone && !customEmail)
      throw new BadRequestException('지정발송은 전화번호 입력이 필요합니다.');

    if (sendType === MessageSendType.KAKAO) {
      if (type === MessageType.CUSTOM)
        return await this.handleCustomKakaoTemplateCreation(workspaceId, dto);

      if (type === MessageType.FULLY_CUSTOM)
        return await this.handleFullyCustomKakaoTemplateCreation(
          workspaceId,
          dto,
        );
    }

    throw new BadRequestException('지원하지 않는 메시지 타입입니다.');
  }

  private async handleCustomKakaoTemplateCreation(
    workspaceId: number,
    dto: CreateMessageBodyDto,
  ) {
    const { kakaoTemplateId, content, ...data } = dto;

    return await this.prismaService.$transaction(async (tx) => {
      const kakaoTemplate = await tx.kakaoTemplate.findUnique({
        where: { id: kakaoTemplateId, isCustomAvailable: true },
      });
      if (!kakaoTemplate)
        throw new NotFoundException('카카오 템플릿이 존재하지 않습니다.');

      return tx.message.create({
        data: {
          content,
          workspaceId,
          kakaoTemplateId: kakaoTemplate.id,
          ...data,
          kakaoTemplate: undefined,
        },
      });
    });
  }

  private async handleFullyCustomKakaoTemplateCreation(
    workspaceId: number,
    dto: CreateMessageBodyDto,
  ) {
    const { kakaoTemplate, ...rest } = dto;

    if (!kakaoTemplate)
      throw new BadRequestException('카카오 템플릿을 생성해야 합니다.');

    return this.prismaService.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: { workspaceId, ...rest, kakaoTemplateId: undefined },
      });

      const { content, buttons, categoryCode, extra, imageId, imageUrl } =
        kakaoTemplate;

      const createdKakaoTemplate = await tx.kakaoTemplate.create({
        data: {
          content,
          buttons,
          templateId: message.id + randomUUID(),
          status: KakaoTemplateStatus.UPLOADED,
          categoryCode,
          extra,
          imageId,
          imageUrl,
        },
      });

      const kakaoTemplateName = `kakao-template-${createdKakaoTemplate.id}`;
      const kakaoTemplateButtons = buttons?.map((button) =>
        this.mapKakaoButton(button),
      );

      const { templateId } = await this.kakaoService.createKakaoTemplate({
        name: kakaoTemplateName,
        buttons: kakaoTemplateButtons,
        content,
        categoryCode,
        extra,
        imageId,
      });

      if (!templateId)
        throw new NotFoundException('카카오 템플릿을 생성할 수 없습니다.');

      try {
        await tx.kakaoTemplate.update({
          where: { id: createdKakaoTemplate.id },
          data: { templateId },
        });

        return await tx.message.update({
          where: { id: message.id },
          data: {
            kakaoTemplate: {
              connect: { id: createdKakaoTemplate.id },
            },
          },
        });
      } catch (error) {
        this.logger.error(error);
        await this.kakaoService.deleteKakaoTemplate(templateId);
        throw error;
      }
    });
  }

  public async requestMessageInspection(
    workspaceId: number,
    messageId: number,
  ) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId, workspaceId, type: MessageType.FULLY_CUSTOM },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    const { kakaoTemplate } = message;
    if (!kakaoTemplate)
      throw new BadRequestException('메시지 템플릿이 존재하지 않습니다.');

    return this.prismaService.$transaction(async (tx) => {
      await this.kakaoService.requestKakaoTemplateInspection(
        kakaoTemplate.templateId,
      );

      await tx.kakaoTemplate.update({
        where: { id: kakaoTemplate.id },
        data: { status: KakaoTemplateStatus.PENDING },
      });

      return message;
    });
  }

  public async cancelMessageInspection(workspaceId: number, messageId: number) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId, workspaceId, type: MessageType.FULLY_CUSTOM },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }
    if (!message.kakaoTemplate)
      throw new BadRequestException('메시지 템플릿이 존재하지 않습니다.');

    if (message.kakaoTemplate.status !== KakaoTemplateStatus.PENDING) {
      throw new NotAcceptableException('검수중인 템플릿이 아닙니다.');
    }

    const { kakaoTemplate } = message;
    return this.prismaService.$transaction(async (tx) => {
      await this.kakaoService.cancelKakaoTemplateInspection(
        kakaoTemplate.templateId,
      );

      await tx.kakaoTemplate.update({
        where: { id: kakaoTemplate.id },
        data: { status: KakaoTemplateStatus.UPLOADED },
      });

      return message;
    });
  }

  public async updateMessage(
    workspaceId: number,
    messageId: number,
    dto: UpdateMessageBodyDto,
  ) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId, workspaceId },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    const { target, customPhone, customEmail } = dto;
    if (target === MessageTarget.CUSTOM && !customPhone && !customEmail) {
      throw new BadRequestException(
        '커스텀 수신자 타입은 전화번호 입력이 필요합니다.',
      );
    }

    const { type, sendType } = message;
    if (sendType === MessageSendType.KAKAO) {
      if (type === MessageType.CUSTOM) {
        return this.updateCustomKakaoTemplate(message, dto);
      }

      if (type === MessageType.FULLY_CUSTOM) {
        return this.updateFullyCustomKakaoTemplate(message, dto);
      }
    }

    throw new BadRequestException('지원하지 않는 메시지 타입입니다.');
  }

  private async updateCustomKakaoTemplate(
    message: Message,
    updateMessageBodyDto: UpdateMessageBodyDto,
  ) {
    return this.prismaService.message.update({
      where: { id: message.id },
      data: {
        ...updateMessageBodyDto,
        kakaoTemplateId: updateMessageBodyDto.kakaoTemplateId ?? undefined,
        kakaoTemplate: undefined,
      },
    });
  }

  private async updateFullyCustomKakaoTemplate(
    message: Prisma.MessageGetPayload<{
      include: { kakaoTemplate: true };
    }>,
    dto: UpdateMessageBodyDto,
  ) {
    const {
      kakaoTemplate,
      name,
      content: messageContent,
      contentGroupId,
      customEmail,
      customPhone,
      target,
    } = dto;

    if (!kakaoTemplate || !message.kakaoTemplate)
      throw new BadRequestException('메시지 템플릿이 존재하지 않습니다.');

    const { content, buttons, categoryCode, extra, imageId, imageUrl } =
      kakaoTemplate;

    const {
      id: kakaoTemplateId,
      status: templateStatus,
      templateId,
    } = message.kakaoTemplate;
    if (
      templateStatus === KakaoTemplateStatus.APPROVED ||
      templateStatus === KakaoTemplateStatus.PENDING
    ) {
      throw new NotAcceptableException(
        '검수 중 또는 검수 완료된 템플릿은 수정할 수 없습니다.',
      );
    }

    const kakaoTemplateButtons = buttons?.map((button) =>
      this.mapKakaoButton(button),
    );

    return await this.prismaService.$transaction(async (tx) => {
      await this.kakaoService.updateKakaoTemplate(templateId, {
        buttons: kakaoTemplateButtons,
        content,
        categoryCode,
        extra,
        imageId,
      });

      await tx.kakaoTemplate.update({
        where: { id: kakaoTemplateId },
        data: { content, buttons, categoryCode, extra, imageId, imageUrl },
      });

      return tx.message.update({
        where: { id: message.id },
        data: {
          name,
          content: messageContent,
          customEmail,
          customPhone,
          target,
          ...(contentGroupId && {
            contentGroup: { connect: { id: contentGroupId } },
          }),
          kakaoTemplate: { connect: { id: kakaoTemplateId } },
        },
      });
    });
  }

  public async deleteMessage(workspaceId: number, messageId: number) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId, workspaceId },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.message.delete({ where: { id: messageId } });

      return message;
    });
  }

  private mapKakaoButton(button: KakaoTemplateButton): KakaoButton {
    const baseButton = { buttonType: button.type, buttonName: button.name };
    if (
      [
        KakaoTemplateButtonType.WL,
        KakaoTemplateButtonType.PR,
        KakaoTemplateButtonType.RW,
        KakaoTemplateButtonType.PC,
      ].includes(button.type)
    ) {
      const { url } = button;

      let targetUrl = url;
      if (button.type === KakaoTemplateButtonType.WL) {
        targetUrl = url;
      }
      if (button.type === KakaoTemplateButtonType.PR) {
        targetUrl = `https://sluurp.io/order/#{이벤트_아이디}/download`;
      }
      if (button.type === KakaoTemplateButtonType.RW) {
        targetUrl = `https://sluurp.io/order/#{이벤트_아이디}/review`;
      }
      if (button.type === KakaoTemplateButtonType.PC) {
        targetUrl = `https://sluurp.io/order/#{이벤트_아이디}/confirm`;
      }

      return {
        ...baseButton,
        buttonType: KakaoTemplateButtonType.WL,
        linkMo: targetUrl,
        linkPc: targetUrl,
      } as KakaoWebButton;
    }

    return baseButton as KakaoDefaultButton;
  }
}
