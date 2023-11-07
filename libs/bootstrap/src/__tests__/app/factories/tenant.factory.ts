import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { TenantEntity } from '../repositories/tenant.entity';
import { TenantStatus } from '../repositories/vo/tenant-status.enum';

export const tenantSeederFactory = setSeederFactory(TenantEntity, () => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: '0',
  } satisfies Pick<
    TenantEntity,
    'tenantName' | 'tenantStatus' | 'tenantFriendlyIdentifier'
  >;

  return plainToInstance(TenantEntity, plainTenant);
});
