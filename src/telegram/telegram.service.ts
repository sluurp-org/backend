import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly CHAT_ID: string = this.configService.get('TELEGRAM_CHAT_ID');
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  async sendMessage(body: {
    userId?: number;
    context?: string;
    workspaceId?: number;
    error?: Error;
    message: string;
    fetal?: boolean;
  }) {
    const { userId, context, workspaceId, message, error, fetal } = body;

    let sendMessage = fetal ? '❗️중대 오류 발생❗️\n' : '';
    if (context) sendMessage += `컨텍스트 : ${context}\n`;
    if (userId) sendMessage += `유저 아이디 : ${userId}\n`;
    if (workspaceId) sendMessage += `워크스페이스 아이디: ${workspaceId}\n`;
    sendMessage += `\n에러 메세지:\n${message}`;

    if (error)
      sendMessage += `\n\n상세정보:\n${error.message}\n\n${error.stack}`;

    try {
      await this.bot.telegram.sendMessage(this.CHAT_ID, sendMessage, {
        disable_notification: !fetal,
      });
    } catch (error) {
      this.logger.error(error, error.stack, TelegramService.name);
    }
  }
}
