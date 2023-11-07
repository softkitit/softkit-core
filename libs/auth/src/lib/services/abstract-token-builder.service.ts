import { IAccessTokenPayload, IRefreshTokenPayload } from '../vo/payload';
import { JwtTokensPayload } from './vo/jwt-tokens-payload';

export abstract class AbstractTokenBuilderService<
  USER,
  ACCESS_TOKEN extends IAccessTokenPayload,
  REFRESH_TOKEN extends IRefreshTokenPayload,
> {
  abstract buildAccessTokenPayload(user: USER): ACCESS_TOKEN;

  abstract buildRefreshTokenPayload(user: USER): REFRESH_TOKEN;

  public buildTokensPayload(user: USER): JwtTokensPayload {
    return {
      accessTokenPayload: this.buildAccessTokenPayload(user),
      refreshTokenPayload: this.buildRefreshTokenPayload(user),
    };
  }
}
