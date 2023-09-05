import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { SAMLConfiguration } from '../../database/entities';
import { BaseTenantRepository, TenantClsStore } from '@softkit/typeorm';

@Injectable()
export class SamlConfigurationRepository extends BaseTenantRepository<SAMLConfiguration> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(SAMLConfiguration, ds, clsService);
  }
}
