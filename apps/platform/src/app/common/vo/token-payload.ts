import { IAccessTokenPayload, IRefreshTokenPayload } from '@softkit/auth';
import { TenantInfo } from './tenant-info';

export interface BaseAccessTokenPayload extends IAccessTokenPayload {
  firstName: string;
  lastName: string;
  logoUrl?: string;
}

export interface MultiTenantAccessTokenPayload extends AccessTokenPayload {
  tenants: TenantInfo[];
}

export interface SingleTenantAccessTokenPayload
  extends AccessTokenPayload,
    TenantInfo {}

export interface RefreshTokenPayload extends IRefreshTokenPayload {}

/**
 * This export is needed to easily replace the implementation of the interface
 * */
export interface AccessTokenPayload extends BaseAccessTokenPayload {}
