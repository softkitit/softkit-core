import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from '@saas-buildkit/nestjs-i18n';
import { JwtPayload } from '../vo/payload';
import { GeneralInternalServerException } from '@softkit/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns{boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // todo memoize
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      logger.error(
        `Seems like a developer mistake.User is not defined, meaning that
        the controller is most likely skipped for auth, but roles guard is applied
        to controller method.Please check if the controller is decorated with @SkipAuth(),
        and if the method is decorated with @Roles()`,
      );
      throw new GeneralInternalServerException();
    }

    return this.matchRoles(roles, user);
  }

  /**
   * Verifies roles match the user's roles
   * @param roles {string[]}
   * @param user {JwtPayload}
   * @returns {boolean}
   */
  async matchRoles(roles: string[], user: JwtPayload): Promise<boolean> {
    const { roles: allRoles } = user;

    return roles.some((role) => allRoles?.includes(role));
  }
}
