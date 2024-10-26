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
  KakaoTemplateStatus,
  Prisma,
  SubscriptionModel,
  Variables,
} from '@prisma/client';
import {
  CreateKakaoTemplateBodyDto,
  KakaoTemplateButton,
  KakaoTemplateButtonType,
} from './dto/req/subtemplate/create-kakao-template-body.dto';
import { KakaoButton, KakaoDefaultButton, KakaoWebButton } from 'solapi';
import { CreateMessageBodyDto } from './dto/req/create-message-body.dto';
import {
  UpdateKakaoTemplateBodyDto,
  UpdateMessageBodyDto,
} from './dto/req/update-message-body.dto';
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
    return this.prismaService.messageTemplate.findMany({
      where: {
        OR: [{ workspaceId: id, name: { contains: name } }, { isGlobal: true }],
      },
      orderBy: { id: 'desc' },
      take,
      skip,
    });
  }

  public async count(id: number, dto: FindMessageQueryDto) {
    const { name } = dto;
    return this.prismaService.messageTemplate.count({
      where: { workspaceId: id, name: { contains: name } },
    });
  }

  public async findOne(id: number, messageId: number) {
    const message = await this.prismaService.messageTemplate.findFirst({
      where: {
        OR: [
          { id: messageId, workspaceId: id },
          { id: messageId, isGlobal: true },
        ],
      },
      include: {
        kakaoTemplate: true,
        contentGroup: true,
      },
    });
    const comments = [];
    if (
      !message.isGlobal &&
      message.kakaoTemplate.status === KakaoTemplateStatus.REJECTED
    ) {
      const kakaoTemplate = await this.kakaoService.getKakaoTemplate(
        message.kakaoTemplate.templateId,
      );

      comments.push(
        ...kakaoTemplate.comments
          .filter((c) => c.isAdmin)
          .map((c) => c.content),
      );
    }

    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    return {
      ...message,
      kakaoTemplate: {
        ...message.kakaoTemplate,
        comments,
      },
    };
  }

  private async checkMessageLimit(
    workspaceId: number,
    workspaceSubscription?: SubscriptionModel,
  ) {
    if (!workspaceSubscription)
      throw new BadRequestException(
        '메시지 템플릿을 생성하기 위해 먼저 워크스페이스 구독이 필요합니다.',
      );

    if (!workspaceSubscription.isMessageEnabled) {
      throw new BadRequestException(
        '메시지 기능이 비활성화되었습니다. 해당 플랜에서는 빠른시작형 메시지만 사용 가능합니다.',
      );
    }

    const messageCount = await this.prismaService.messageTemplate.count({
      where: { workspaceId },
    });

    const { messageLimit } = workspaceSubscription;

    if (messageLimit !== 0 && messageCount >= messageLimit) {
      throw new BadRequestException(
        `메시지 템플릿 생성 가능 개수를 초과하였습니다. 최대 ${messageLimit}개까지 생성 가능합니다.`,
      );
    }
  }

  public async createMessage(
    workspaceId: number,
    dto: CreateMessageBodyDto,
    workspaceSubscription?: SubscriptionModel,
  ) {
    await this.checkMessageLimit(workspaceId, workspaceSubscription);

    const { name, kakaoTemplate, ...rest } = dto;
    return this.prismaService.$transaction(async (tx) => {
      const message = await tx.messageTemplate.create({
        data: { name, workspaceId, ...rest },
      });

      await this.handleKakaoTemplateCreation(tx, message.id, kakaoTemplate);
      return message;
    });
  }

  private async handleKakaoTemplateCreation(
    tx: Prisma.TransactionClient,
    messageId: number,
    kakaoTemplate: CreateKakaoTemplateBodyDto,
  ) {
    const { content, buttons, categoryCode, extra, imageId, imageUrl } =
      kakaoTemplate;
    const createdKakaoTemplate = await tx.kakaoTemplate.create({
      data: {
        content,
        buttons,
        templateId: messageId + randomUUID(),
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
      await tx.messageTemplate.update({
        where: { id: messageId },
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
  }

  public async requestMessageInspection(
    workspaceId: number,
    messageId: number,
  ) {
    const message = await this.prismaService.messageTemplate.findUnique({
      where: { id: messageId, workspaceId, isGlobal: false },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    const { kakaoTemplate } = message;
    return this.prismaService.$transaction(async (tx) => {
      await this.kakaoService.requestKakaoTemplateInspection(
        kakaoTemplate.templateId,
      );

      return tx.kakaoTemplate.update({
        where: { id: kakaoTemplate.id },
        data: { status: KakaoTemplateStatus.PENDING },
      });
    });
  }

  public async cancelMessageInspection(workspaceId: number, messageId: number) {
    const message = await this.prismaService.messageTemplate.findUnique({
      where: { id: messageId, workspaceId, isGlobal: false },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    if (message.kakaoTemplate.status !== KakaoTemplateStatus.PENDING) {
      throw new NotAcceptableException('검수중인 템플릿이 아닙니다.');
    }

    const { kakaoTemplate } = message;
    return this.prismaService.$transaction(async (tx) => {
      await this.kakaoService.cancelKakaoTemplateInspection(
        kakaoTemplate.templateId,
      );

      return tx.kakaoTemplate.update({
        where: { id: kakaoTemplate.id },
        data: { status: KakaoTemplateStatus.UPLOADED },
      });
    });
  }

  public async updateMessage(
    workspaceId: number,
    messageId: number,
    dto: UpdateMessageBodyDto,
  ) {
    const message = await this.prismaService.messageTemplate.findUnique({
      where: { id: messageId, workspaceId, isGlobal: false },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    const { name, variables, contentGroupId, kakaoTemplate, completeDelivery } =
      dto;
    return this.prismaService.$transaction(async (tx) => {
      if (kakaoTemplate)
        await this.updateKakaoTemplate(tx, message, kakaoTemplate);

      return tx.messageTemplate.update({
        where: { id: messageId },
        data: {
          name,
          variables: variables || [],
          contentGroupId,
          completeDelivery,
        },
      });
    });
  }

  private async updateKakaoTemplate(
    tx: Prisma.TransactionClient,
    message: Prisma.MessageTemplateGetPayload<{
      include: { kakaoTemplate: true };
    }>,
    dto: UpdateKakaoTemplateBodyDto,
  ) {
    if (
      message.kakaoTemplate.status === KakaoTemplateStatus.APPROVED ||
      message.kakaoTemplate.status === KakaoTemplateStatus.PENDING
    ) {
      throw new NotAcceptableException(
        '검수 중 또는 검수 완료된 템플릿은 수정할 수 없습니다.',
      );
    }

    const { content, buttons, categoryCode, extra, imageId, imageUrl } = dto;
    const kakaoTemplateButtons = buttons.map((button) =>
      this.mapKakaoButton(button),
    );

    await this.kakaoService.updateKakaoTemplate(
      message.kakaoTemplate.templateId,
      {
        buttons: kakaoTemplateButtons,
        content,
        categoryCode,
        extra,
        imageId,
      },
    );

    await tx.kakaoTemplate.update({
      where: { id: message.kakaoTemplate.id },
      data: { content, buttons, categoryCode, extra, imageId, imageUrl },
    });
  }

  public async deleteMessage(workspaceId: number, messageId: number) {
    const message = await this.prismaService.messageTemplate.findUnique({
      where: { id: messageId, workspaceId, isGlobal: false },
      include: { kakaoTemplate: true },
    });
    if (!message) {
      throw new NotFoundException('메시지 템플릿이 존재하지 않습니다.');
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.messageTemplate.delete({ where: { id: messageId } });
      await this.kakaoService.deleteKakaoTemplate(
        message.kakaoTemplate.templateId,
      );

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

  public replaceVariables(variables: Variables[], body: any, content: string) {
    const variableMap = variables.reduce(
      (map, variable) => {
        map[variable.key] = variable.value;
        return map;
      },
      {} as Record<string, string>,
    );

    const regex = /\{(.*?)\}/g;
    const replacedStr = content.replace(regex, (match, p1) => {
      const valueName = variableMap[p1];
      const value = body[valueName];
      return value !== undefined ? value.toString() : match;
    });

    return replacedStr;
  }
}
