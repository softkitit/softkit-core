import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseTenantRepository } from '../../lib/repositories/tenant-base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { TenantClsStore } from '../../lib/vo/tenant-base-cls-store';
import { TestTenantBaseEntity } from './test-base-tenant.entity';

@Injectable()
export class TestBaseTenantRepository extends BaseTenantRepository<TestTenantBaseEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TestTenantBaseEntity, ds, clsService);
  }
}
