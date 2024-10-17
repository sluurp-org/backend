import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqSubscription = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.subscription;
  },
);
