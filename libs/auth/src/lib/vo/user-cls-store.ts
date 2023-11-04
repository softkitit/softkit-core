import { TenantClsStore } from '@softkit/typeorm';
import { IAccessTokenPayload } from './payload';

export interface UserClsStore<T extends IAccessTokenPayload>
  extends TenantClsStore {
  jwtPayload: T;
  reqId: string;
  userId: string;
  authHeader: string;
}
