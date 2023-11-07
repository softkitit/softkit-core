import { setSeederFactory } from 'typeorm-extension';
import { TenantEntity } from '../repositories/tenant.entity';
import { faker } from '@faker-js/faker';

export const tenantSeederFactory = setSeederFactory(TenantEntity, () => {
  const tenant = new TenantEntity();
  tenant.tenantName = faker.company.name();
  tenant.tenantUrl = faker.internet.url();
  tenant.version = 0;

  return tenant;
});
