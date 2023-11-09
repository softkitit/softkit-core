import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { TenantEntity } from '../repositories/tenant.entity';
import { TenantStatus } from '../repositories/vo/tenant-status.enum';
import { isMeta } from './utils/functions';
import { faker } from '@faker-js/faker';
import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@softkit/typeorm';
import { OmittedEntity } from './vo/entity-omit.type';

export const tenantFactory = setSeederFactory(TenantEntity, (_, meta) => {
  const plainTenant = {
    tenantName: faker.company.name(),
    tenantStatus: TenantStatus.ACTIVE,
    tenantFriendlyIdentifier: faker.company.name(),
    ownerId: '',
  } satisfies OmittedEntity<
    TenantEntity,
    typeof DEFAULT_CREATE_ENTITY_EXCLUDE_LIST
  >;

  if (isMeta(meta)) {
    plainTenant.ownerId = meta.ownerId;
  }

  return plainToInstance(TenantEntity, plainTenant);
});
