import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { TenantEntity } from '../repositories/tenant.entity';
import { TenantStatus } from '../repositories/vo/tenant-status.enum';
import { isMeta } from './utils/functions';
import { PickType } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

class TenantFactory extends PickType(TenantEntity, [
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

export const tenantFactory = setSeederFactory(TenantEntity, (_, meta) => {
  const plainTenant = new TenantFactory();

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(TenantEntity, plainTenant);
});
