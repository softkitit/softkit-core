export interface IAccessTokenPayload {
  sub: string;
  email: string;
}

export interface PermissionsBaseJwtPayload extends IAccessTokenPayload {
  permissions: string[];
}

export interface IAccessTokenPayloadWithTenantsInfo
  extends IAccessTokenPayload {
  tenants: TenantInfo[];
}

export interface IAccessTokenSingleTenantPayload extends IAccessTokenPayload {
  tenantId: string;
}

export interface IRefreshTokenPayload extends IAccessTokenPayload {}

export interface TenantInfo {
  tenantId: string;
}

export interface PayloadSigned {
  iat: number;
  exp: number;
}
