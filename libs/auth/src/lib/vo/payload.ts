export interface IAccessTokenPayload {
  sub: string;
  email: string;
}

export interface PermissionsBaseJwtPayload extends IAccessTokenPayload {
  permissions: string[];
}

export interface IRefreshTokenPayload extends IAccessTokenPayload {}

export interface PayloadSigned {
  iat: number;
  exp: number;
}
