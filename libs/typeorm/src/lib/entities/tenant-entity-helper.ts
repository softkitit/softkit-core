import { BaseEntityHelper } from './entity-helper';
import { Column, Index } from 'typeorm';
import { ClsPreset } from '../subscribers/decorator/cls-preset.decorator';
import { TenantClsStore } from '../vo/tenant-base-cls-store';

export class BaseTenantEntityHelper extends BaseEntityHelper {
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  @Index({ where: '"deleted_at" IS NOT NULL' })
  tenantId!: string;
}
