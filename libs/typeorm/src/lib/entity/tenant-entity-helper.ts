import { BaseTrackedEntityHelper } from './entity-helper';
import { Column, Index } from 'typeorm';
import { ClsPreset } from '../subscribers/decorator/cls-preset.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseTenantedEntity, TenantClsStore } from '@softkit/persistence-api';

export class BaseTenantEntityHelper
  extends BaseTrackedEntityHelper
  implements BaseTenantedEntity
{
  @ApiProperty({
    description: 'Tenant identifier',
    type: 'string',
  })
  @ClsPreset<TenantClsStore>({
    clsFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  @Index()
  @Expose()
  tenantId!: string;
}
