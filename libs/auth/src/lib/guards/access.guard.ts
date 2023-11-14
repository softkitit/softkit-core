import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { AbstractAccessCheckService } from '../services/access-check.service';
import { PermissionCheckMode } from '../decorators/permission.decorator';
import {
  IAccessTokenPayload,
  IAccessTokenPayloadWithTenantsInfo,
} from '../vo/payload';
import { UserClsStore } from '../vo/user-cls-store';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AccessGuard.name);

  constructor(
    private reflector: Reflector,
    private clsService: ClsService<
      UserClsStore<IAccessTokenPayloadWithTenantsInfo<unknown>>
    >,
    @Optional()
    private accessCheckService?: AbstractAccessCheckService<IAccessTokenPayload>,
  ) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns {boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [permissions, checkMode] = this.getPermissionsMetadata(context);
    const [roles] = this.getRolesMetadata(context);

    /**
     * it just secured endpoint without permissions
     * */
    if (permissions.length === 0 && roles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.error(
        `Seems like a developer mistake. User is not defined, meaning that
        the controller is most likely skipped for auth, but permission guard is applied
        to controller method. Please check if the controller is decorated with @SkipAuth(),
        and if the method is decorated with @Permissions() or @Roles()`,
      );
      throw new GeneralInternalServerException();
    }

    // check roles must be first because it's coming from the jwt check and no need for db calls
    const rolesMatch = await this.checkRoles(
      user,
      roles as unknown as string[],
    );
    return (
      rolesMatch ||
      (await this.accessCheckService?.checkPermissions(
        checkMode as PermissionCheckMode,
        user,
        permissions as unknown as string[],
      )) ||
      false
    );
  }

  private getRolesMetadata(context: ExecutionContext) {
    return this.reflector.get<string[]>('roles', context.getHandler()) || [[]];
  }

  private getPermissionsMetadata(context: ExecutionContext) {
    return (
      this.reflector.get<string[]>('permissions', context.getHandler()) || [[]]
    );
  }

  private async checkRoles(
    user: IAccessTokenPayloadWithTenantsInfo<unknown>,
    acceptableRoles?: string[],
  ): Promise<boolean> {
    if (acceptableRoles === undefined || acceptableRoles.length === 0) {
      return false;
    }

    const currentTenant = this.clsService.get().tenantId;

    const tenantInfo = user.tenants.find(
      (tenant) => tenant.tenantId === currentTenant,
    );

    if (tenantInfo === undefined) {
      return false;
    }

    return tenantInfo.roles.some((r) =>
      acceptableRoles.includes(r.roleType as string),
    );
  }
}
