import {
  BaseTenantEntityHelper,
  BaseTypeormTenantedEntityRepository,
} from '@softkit/typeorm';
import { TenantEntity } from '../entity/tenant.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantRepository extends BaseTypeormTenantedEntityRepository<
  TenantEntity,
  'companyWebsite',
  'companyWebsite' | 'version',
  keyof BaseTenantEntityHelper | 'tenantId' | 'version'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<{
      tenantId?: string;
    }>,
  ) {
    super(TenantEntity, ds, 'companyWebsite', clsService);
  }
}
