import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PortOne from '@portone/server-sdk';
import { Observable } from 'rxjs';

@Injectable()
export class PortoneGuard {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean | Promise<boolean> | Observable<boolean>> {
    const request = context.switchToHttp().getRequest();

    const { body, headers } = request;
    const secret = this.configService.get<string>('PORTONE_WEBHOOK_SECRET');

    try {
      await PortOne.Webhook.verify(secret, JSON.stringify(body), headers);
      return true;
    } catch (error) {
      return false;
    }
  }
}
