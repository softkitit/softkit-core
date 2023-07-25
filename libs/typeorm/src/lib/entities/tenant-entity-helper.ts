import { BaseEntityHelper } from './entity-helper';
import { Column, Index } from 'typeorm';
import { ClsPresetDecorator } from "@saas-buildkit/typeorm";

export class BaseTenantEntityHelper extends BaseEntityHelper {
  @ClsPresetDecorator<{tenantId: string}>({
    clsPropertyFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  @Index({ where: '"deleted_at" IS NOT NULL' })
  tenantId!: string;
}
