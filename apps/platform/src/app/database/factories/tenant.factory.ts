import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { TenantStatus } from '../entities/tenants/vo/tenant-status.enum';

export const tenantSeederFactory = setSeederFactory(Tenant, () => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: '0',
  } satisfies Pick<
    Tenant,
    'tenantName' | 'tenantStatus' | 'tenantFriendlyIdentifier'
  >;

  return plainToInstance(Tenant, plainTenant);
});
