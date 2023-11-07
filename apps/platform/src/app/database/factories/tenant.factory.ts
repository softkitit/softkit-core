import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';

export const tenantSeederFactory = setSeederFactory(Tenant, () => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantUrl: faker.internet.url(),
    version: 0,
  } satisfies Pick<Tenant, 'tenantName' | 'tenantUrl' | 'version'>;

  return plainToInstance(Tenant, plainTenant);
});
