export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

export interface JwtRefreshPayload {
  sub: string;
  tenantId: string;
}
