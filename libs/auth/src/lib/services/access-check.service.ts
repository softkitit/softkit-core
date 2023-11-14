import { PermissionCheckMode } from '../decorators/permission.decorator';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { Logger } from '@nestjs/common';
import { IAccessTokenPayload } from '../vo/payload';

export abstract class AbstractAccessCheckService<
  T extends IAccessTokenPayload,
> {
  protected logger: Logger = new Logger(AbstractAccessCheckService.name);

  abstract hasEach(permissions: string[], jwtPayload: T): Promise<boolean>;

  abstract hasAny(permissions: string[], jwtPayload: T): Promise<boolean>;

  public async checkPermissions(
    checkMode: PermissionCheckMode,
    jwtPayload: T,
    permissions?: string[],
  ) {
    if (permissions === undefined || permissions.length === 0) {
      return false;
    }

    switch (checkMode) {
      case PermissionCheckMode.ANY: {
        return this.hasAny(permissions, jwtPayload);
      }
      case PermissionCheckMode.EACH: {
        return this.hasEach(permissions, jwtPayload);
      }
      default: {
        this.logger.error(`Unknown permission check mode: ${checkMode}.
        Seems like someone added new permission method but forgot to handle it`);

        throw new GeneralInternalServerException();
      }
    }
  }
}
