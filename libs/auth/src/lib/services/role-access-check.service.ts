import { GeneralInternalServerException } from '@softkit/exceptions';
import { Logger } from '@nestjs/common';
import { IAccessTokenPayload } from '../vo/payload';
import { RoleCheckMode } from '../decorators/role.decorator';

export abstract class AbstractRoleAccessCheckService<
  T extends IAccessTokenPayload,
> {
  protected logger: Logger = new Logger(AbstractRoleAccessCheckService.name);

  abstract hasEach(roles: string[], jwtPayload: T): Promise<boolean>;

  abstract hasAny(roles: string[], jwtPayload: T): Promise<boolean>;

  public async checkRoles(
    checkMode: RoleCheckMode,
    jwtPayload: T,
    roles?: string[],
  ) {
    if (roles === undefined || roles.length === 0) {
      return false;
    }

    switch (checkMode) {
      case RoleCheckMode.ANY: {
        return this.hasAny(roles, jwtPayload);
      }
      case RoleCheckMode.EACH: {
        return this.hasEach(roles, jwtPayload);
      }
      default: {
        this.logger.error(`Unknown role check mode: ${checkMode}.
        Seems like someone added new role method but forgot to handle it`);

        throw new GeneralInternalServerException();
      }
    }
  }
}
