import { TenantClsStore } from '@softkit/typeorm';

export interface UserClsStore extends TenantClsStore {
  userId: string;
  authHeader: string;
}
