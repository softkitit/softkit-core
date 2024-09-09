import { RoleType } from '../../__tests__/app/controllers/vo/role-type';
import { RolesBaseJwtPayload } from '../vo/payload';
import { AbstractRoleAccessCheckService } from './role-access-check.service';

export class RoleTokenAccessCheckService extends AbstractRoleAccessCheckService<
  RolesBaseJwtPayload<RoleType>
> {
  public override async hasEach(
    roles: RoleType[],
    jwtPayload: RolesBaseJwtPayload<RoleType>,
  ): Promise<boolean> {
    if (jwtPayload.roles === null || jwtPayload.roles === undefined) {
      this.logger.warn(
        `RoleTokenAccessCheckService.hasEach: JwtPayload doesn't have any roles, it can be related to some misconfiguration`,
      );
    }

    const userRoleTypes = new Set(
      jwtPayload?.roles?.map((role) => role.roleType),
    );
    return roles.every((role) => userRoleTypes.has(role));
  }

  public override async hasAny(
    roles: RoleType[],
    jwtPayload: RolesBaseJwtPayload<RoleType>,
  ): Promise<boolean> {
    if (jwtPayload.roles === null || jwtPayload.roles === undefined) {
      this.logger.warn(
        `RoleTokenAccessCheckService.hasAny: JwtPayload doesn't have any roles, it can be related to some misconfiguration`,
      );
    }

    const userRoleTypes = new Set(
      jwtPayload?.roles?.map((role) => role.roleType),
    );
    const anyRole = roles.find((role) => userRoleTypes.has(role));
    return anyRole !== undefined;
  }
}
