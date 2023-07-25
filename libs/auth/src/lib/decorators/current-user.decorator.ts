import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from "@saas-buildkit/auth";

export const CurrentUser = createParamDecorator<JwtPayload>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
