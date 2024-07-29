import type { ClsStore } from 'nestjs-cls';

export interface TenantClsStore extends ClsStore {
  tenantId?: string;
}
