import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';
import { plainToInstance } from 'class-transformer';
import { TenantStatus } from '../entities/tenants/vo/tenant-status.enum';
import { isMeta } from './utils/functions';

export const tenantFactory = setSeederFactory(Tenant, (faker, meta) => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: faker.company.name(),
    ownerId: '',
  } satisfies Pick<
    Tenant,
    'tenantName' | 'tenantStatus' | 'tenantFriendlyIdentifier' | 'ownerId'
  >;

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(Tenant, plainTenant);
});
