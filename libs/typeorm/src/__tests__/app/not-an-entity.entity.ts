import { ClsPreset } from '../../lib/subscribers/decorator/cls-preset.decorator';
import { TenantClsStore } from '../../lib/vo/tenant-base-cls-store';

/**
 * Test adding cls preset decorator to a class that is not an entity
 * */
export class NotAnEntity {
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  id!: string;
}
