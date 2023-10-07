import { AbstractAccessCheckService } from './access-check.service';
import { PermissionsBaseJwtPayload } from '../vo/payload';

export class TokenAccessCheckService extends AbstractAccessCheckService<PermissionsBaseJwtPayload> {
  public override async hasEach(
    permissions: string[],
    jwtPayload: PermissionsBaseJwtPayload,
  ): Promise<boolean> {
    if (
      jwtPayload.permissions === null ||
      jwtPayload.permissions === undefined
    ) {
      this.logger.warn(
        `TokenAccessCheckService.hasEach: JwtPayload doesn't have any permissions, it can be related to some misconfiguration`,
      );
    }

    const userPermissions = new Set(jwtPayload.permissions || []);
    return permissions.every((permission) => userPermissions.has(permission));
  }

  public override async hasAny(
    permissions: string[],
    jwtPayload: PermissionsBaseJwtPayload,
  ): Promise<boolean> {
    if (
      jwtPayload.permissions === null ||
      jwtPayload.permissions === undefined
    ) {
      this.logger.warn(
        `TokenAccessCheckService.hasAny: JwtPayload doesn't have any permissions, it can be related to some misconfiguration`,
      );
    }

    const userPermissions = new Set(jwtPayload.permissions || []);
    const anyPermission = permissions.find((permission) =>
      userPermissions.has(permission),
    );
    return anyPermission !== undefined;
  }
}
