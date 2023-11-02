import { AbstractTokenBuilderService } from '@softkit/auth';
import { UserProfile } from '../../../database/entities';
import {
  BaseAccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';

export class NoTenantTokenBuilderService extends AbstractTokenBuilderService<
  UserProfile,
  BaseAccessTokenPayload,
  RefreshTokenPayload
> {
  override buildAccessTokenPayload(user: UserProfile): BaseAccessTokenPayload {
    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  override buildRefreshTokenPayload(user: UserProfile): RefreshTokenPayload {
    return {
      sub: user.id,
      email: user.email,
    };
  }
}
