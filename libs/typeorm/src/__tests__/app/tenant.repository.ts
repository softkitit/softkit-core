import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { BaseTypeormTrackedEntityRepository } from '../../lib/repositories/base-typeorm-tracked-entity.repository';

@Injectable()
export class TenantRepository extends BaseTypeormTrackedEntityRepository<
  TenantEntity,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(TenantEntity, ds, 'id');
  }
}
