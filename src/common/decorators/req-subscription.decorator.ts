import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ReqSubscription = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;

    console.log(request.workspace);
    if (request.workspace.subscriptionEndedAt < new Date()) return null;

    return request.subscription;
  },
);
