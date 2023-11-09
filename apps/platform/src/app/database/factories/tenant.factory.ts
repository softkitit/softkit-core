import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';
import { plainToInstance } from 'class-transformer';
import { TenantStatus } from '../entities/tenants/vo/tenant-status.enum';
import { isMeta } from './utils/functions';
import { faker } from '@faker-js/faker';
import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@softkit/typeorm';
import { ExcludeKeys } from '@softkit/common-types';

export const tenantFactory = setSeederFactory(Tenant, (_, meta) => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: faker.company.name(),
    ownerId: '',
  } satisfies ExcludeKeys<Tenant, typeof DEFAULT_CREATE_ENTITY_EXCLUDE_LIST>;

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(Tenant, plainTenant);
});
