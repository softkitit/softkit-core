import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';
import { plainToInstance } from 'class-transformer';
import { TenantStatus } from '../entities/tenants/vo/tenant-status.enum';
import { isMeta } from './utils/functions';
import { PickType } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

class TenantFactory extends PickType(Tenant, [
  'tenantName',
  'tenantStatus',
  'tenantFriendlyIdentifier',
  'ownerId',
]) {
  constructor() {
    super();
    this.ownerId = '';
    this.tenantFriendlyIdentifier = faker.company.name();
    this.tenantName = faker.company.name();
    this.tenantStatus = TenantStatus.ACTIVE;
  }
}

export const tenantFactory = setSeederFactory(Tenant, (_, meta) => {
  const plainTenant = new TenantFactory();

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(Tenant, plainTenant);
});
