import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAccessTokenPayload } from '../vo/payload';

export const CurrentUser = createParamDecorator<IAccessTokenPayload>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
