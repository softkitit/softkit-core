import { AbstractTokenBuilderService } from '@softkit/auth';
import { UserProfile } from '../../../database/entities';
import {
  RefreshTokenPayload,
  SingleTenantAccessTokenPayload,
} from '../../../common/vo/token-payload';
import { Logger } from '@nestjs/common';
import { GeneralInternalServerException } from '@softkit/exceptions';

export class SingleTenantTokenBuilderService extends AbstractTokenBuilderService<
  UserProfile,
  SingleTenantAccessTokenPayload,
  RefreshTokenPayload
> {
  private logger = new Logger(SingleTenantTokenBuilderService.name);

  override buildAccessTokenPayload(
    user: UserProfile,
  ): SingleTenantAccessTokenPayload {
    if (user.userTenantsAccounts?.length !== 1) {
      this.logger.error(
        `User ${user.id} has ${user.userTenantsAccounts?.length} tenants accounts. This should not happen under normal circumstances.
         User must has one and only one account. Investigate immediately!`,
      );

      throw new GeneralInternalServerException('User tenants misconfiguration');
    }

    const tenantAccount = user.userTenantsAccounts[0];

    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: tenantAccount.tenantId,
      roles: tenantAccount.roles.map((role) => role.id),
    };
  }

  override buildRefreshTokenPayload(user: UserProfile): RefreshTokenPayload {
    return {
      sub: user.id,
      email: user.email,
    };
  }
}
