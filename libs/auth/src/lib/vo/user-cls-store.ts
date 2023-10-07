import { TenantClsStore } from '@softkit/typeorm';
import { IJwtPayload } from './payload';

export interface UserClsStore<T extends IJwtPayload> extends TenantClsStore {
  jwtPayload: T;
  userId: string;
  authHeader: string;
  tenantId: string;
}
