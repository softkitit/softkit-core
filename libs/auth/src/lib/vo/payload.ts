export interface IJwtPayload {
  sub: string;
  email: string;
}

export interface PermissionsBaseJwtPayload extends IJwtPayload {
  permissions: string[];
}

export interface JwtRefreshTokenPayload extends IJwtPayload {}

export interface PayloadSigned {
  iat: number;
  exp: number;
}
