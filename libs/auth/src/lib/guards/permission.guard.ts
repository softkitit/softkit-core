import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { AbstractAccessCheckService } from '../services/access-check.service';
import { PermissionCheckMode } from '../decorators/permission.decorator';
import { IJwtPayload } from '../vo/payload';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger: Logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private accessCheckService: AbstractAccessCheckService<IJwtPayload>,
  ) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns {boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [permissions, checkMode] =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    /**
     * it just secured endpoint without permissions
     * */
    if (
      permissions === null ||
      permissions === undefined ||
      permissions.length === 0
    ) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.error(
        `Seems like a developer mistake. User is not defined, meaning that
        the controller is most likely skipped for auth, but permission guard is applied
        to controller method.Please check if the controller is decorated with @SkipAuth(),
        and if the method is decorated with @Permissions()`,
      );
      throw new GeneralInternalServerException();
    }

    return this.accessCheckService.checkPermissions(
      permissions as unknown as string[],
      checkMode as PermissionCheckMode,
      user,
    );
  }
}
