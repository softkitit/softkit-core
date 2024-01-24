import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseTenantRepository } from '../../lib/repositories/tenant-base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { TenantClsStore } from '../../lib/vo/tenant-base-cls-store';
import { TenantUserEntity } from './user-tenant.entity';

@Injectable()
export class TenantUserRepository extends BaseTenantRepository<
  TenantUserEntity,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TenantUserEntity, ds, 'id', clsService);
  }
}
