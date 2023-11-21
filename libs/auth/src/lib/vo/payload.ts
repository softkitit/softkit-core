export interface IAccessTokenPayload {
  sub: string;
  email: string;
}

export interface PermissionsBaseJwtPayload extends IAccessTokenPayload {
  permissions: string[];
}

export interface IAccessTokenPayloadWithTenantsInfo<T>
  extends IAccessTokenPayload {
  tenants: TenantInfo<T>[];
}

export interface IAccessTokenSingleTenantPayload extends IAccessTokenPayload {
  tenantId: string;
}

export interface IRefreshTokenPayload extends IAccessTokenPayload {}

export interface TenantInfo<T> {
  tenantId: string;
  roles: RoleInfo<T>[];
}

export interface RoleInfo<T> {
  roleId: string;
  roleType?: T;
}

export interface PayloadSigned {
  iat: number;
  exp: number;
}
