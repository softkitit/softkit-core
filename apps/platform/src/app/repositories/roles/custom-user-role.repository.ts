import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { CustomUserRole } from '../../database/entities';
import { BaseTenantRepository, TenantClsStore } from '@saas-buildkit/typeorm';

@Injectable()
export class CustomUserRoleRepository extends BaseTenantRepository<CustomUserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(CustomUserRole, ds, clsService);
  }
}
