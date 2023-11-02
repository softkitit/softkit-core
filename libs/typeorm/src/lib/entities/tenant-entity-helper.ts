import { BaseEntityHelper } from './entity-helper';
import { Column, Index } from 'typeorm';
import { ClsPreset } from '../subscribers/decorator/cls-preset.decorator';
import { TenantClsStore } from '../vo/tenant-base-cls-store';
import { ApiProperty } from '@nestjs/swagger';

export class BaseTenantEntityHelper extends BaseEntityHelper {
  @ApiProperty({
    description: 'Tenant identifier',
    type: 'string',
  })
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  @Index()
  tenantId!: string;
}
