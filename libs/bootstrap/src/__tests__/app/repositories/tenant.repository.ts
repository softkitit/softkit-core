import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(TenantEntity, ds, 'id');
  }
}
