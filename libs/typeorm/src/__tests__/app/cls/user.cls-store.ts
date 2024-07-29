import { TenantClsStore } from '@softkit/persistence-api';

export interface UserAndTenantClsStore extends TenantClsStore {
  userId: string;
}
