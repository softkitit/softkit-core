import { TenantClsStore } from '../../../lib/vo/tenant-base-cls-store';

export interface UserAndTenantClsStore extends TenantClsStore {
  userId: string;
}
