import { IAccessTokenPayload, IRefreshTokenPayload } from '../../vo/payload';

export interface JwtTokensPayload {
  accessTokenPayload: IAccessTokenPayload;
  refreshTokenPayload: IRefreshTokenPayload;
}
