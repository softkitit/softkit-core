import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../../database/entities';
import { BaseTenantRepository, TenantClsStore } from '@softkit/typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserRoleTenantRepository extends BaseTenantRepository<UserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(UserRole, ds, clsService);
  }
}
