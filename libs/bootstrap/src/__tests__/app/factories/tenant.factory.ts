import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { TenantEntity } from '../repositories/tenant.entity';
import { TenantStatus } from '../repositories/vo/tenant-status.enum';
import { isMeta } from './utils/functions';

export const tenantFactory = setSeederFactory(TenantEntity, (faker, meta) => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: faker.company.name(),
    ownerId: '',
  } satisfies Pick<
    TenantEntity,
    'tenantName' | 'tenantStatus' | 'tenantFriendlyIdentifier' | 'ownerId'
  >;

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(TenantEntity, plainTenant);
});
