import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomUserRole } from '../../database/entities';
import { BaseTenantRepository, TenantClsStore } from '@softkit/typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class CustomUserRoleTenantRepository extends BaseTenantRepository<CustomUserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(CustomUserRole, ds, clsService);
  }
}
