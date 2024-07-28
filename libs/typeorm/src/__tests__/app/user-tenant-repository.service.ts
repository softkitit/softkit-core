import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseTypeormTenantedEntityRepository } from '../../lib/repositories/tenant-base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { TenantClsStore } from '@softkit/persistence-api';
import { TenantUserEntity } from './user-tenant.entity';
import { BaseTrackedEntityHelper } from '../../lib/entity/entity-helper';

@Injectable()
export class TenantUserRepository extends BaseTypeormTenantedEntityRepository<
  TenantUserEntity,
  'id',
  'id' | 'version',
  | 'tenantId'
  | 'createdBy'
  | 'updatedBy'
  | 'id'
  | 'version'
  | keyof BaseTrackedEntityHelper
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TenantUserEntity, ds, 'id', clsService);
  }
}
