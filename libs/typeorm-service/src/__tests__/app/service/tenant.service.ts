import { BaseTenantEntityService } from '../../../lib/base-tenant.service';
import { TenantEntity } from '../entity/tenant.entity';
import { TenantRepository } from '../repository/tenant.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantService extends BaseTenantEntityService<
  TenantEntity,
  'companyWebsite',
  TenantRepository,
  Pick<TenantEntity, 'companyWebsite' | 'version'>
> {
  constructor(repository: TenantRepository) {
    super(repository);
  }
}
