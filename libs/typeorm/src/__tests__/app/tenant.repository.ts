import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../lib/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TenantEntity } from './tenant.entity';

@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(TenantEntity, ds, 'id');
  }
}
