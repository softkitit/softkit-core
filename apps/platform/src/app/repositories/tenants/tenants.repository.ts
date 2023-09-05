import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Tenant } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class TenantsRepository extends BaseRepository<Tenant> {
  constructor(
    @InjectDataSource()
    readonly ds: DataSource,
  ) {
    super(Tenant, ds);
  }
}
