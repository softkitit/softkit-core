import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from 'nestjs-i18n';
import { JwtPayload } from "@saas-buildkit/auth";
import { GeneralInternalServerException } from "@saas-buildkit/exceptions";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns{boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // todo memoize
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!permissions?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      logger.error(
        `Seems like a developer mistake.User is not defined, meaning that
        the controller is most likely skipped for auth, but permission guard is applied
        to controller method.Please check if the controller is decorated with @SkipAuth(),
        and if the method is decorated with @Permissions()`,
      );
      throw new GeneralInternalServerException();
    }

    return this.matchPermissions(permissions, user);
  }

  /**
   * Verifies permissions match the user's permissions
   * @param permissions {string[]}
   * @param user {JwtPayload}
   * @returns {boolean}
   */
  async matchPermissions(
    permissions: string[],
    user: JwtPayload,
  ): Promise<boolean> {
    const { permissions: allPermissions } = user;

    return permissions.some((permission) =>
      allPermissions?.includes(permission),
    );
  }
}
