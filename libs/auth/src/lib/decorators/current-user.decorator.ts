import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from '../vo/payload';

export const CurrentUser = createParamDecorator<IJwtPayload>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
