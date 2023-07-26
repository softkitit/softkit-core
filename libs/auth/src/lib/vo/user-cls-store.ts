import { TenantClsStore } from '@saas-buildkit/typeorm';

export interface UserClsStore extends TenantClsStore {
  userId: string;
}
