import { TenantEntity } from '../entity/tenant.entity';
import { TenantRepository } from '../repository/tenant.repository';
import { Injectable } from '@nestjs/common';
import { BaseTrackedEntityService } from '../../../lib/base-tracked-entity.service';
import { BaseTenantEntityHelper } from '@softkit/typeorm';

@Injectable()
export class TenantService extends BaseTrackedEntityService<
  TenantEntity,
  'companyWebsite',
  TenantRepository,
  'companyWebsite' | 'version',
  keyof BaseTenantEntityHelper | 'tenantId' | 'version'
> {
  constructor(repository: TenantRepository) {
    super(repository);
  }
}
