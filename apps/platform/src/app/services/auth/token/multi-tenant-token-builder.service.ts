import { AbstractTokenBuilderService } from '@softkit/auth';
import { UserProfile } from '../../../database/entities';
import {
  MultiTenantAccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';

export class MultiTenantTokenBuilderService extends AbstractTokenBuilderService<
  UserProfile,
  MultiTenantAccessTokenPayload,
  RefreshTokenPayload
> {
  override buildAccessTokenPayload(
    user: UserProfile,
  ): MultiTenantAccessTokenPayload {
    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenants: (user.userTenantsAccounts || []).map((tenantAccount) => ({
        tenantId: tenantAccount.tenantId,
        roles: tenantAccount.roles?.map((role) => role.id),
      })),
    };
  }

  override buildRefreshTokenPayload(user: UserProfile): RefreshTokenPayload {
    return {
      sub: user.id,
      email: user.email,
    };
  }
}
