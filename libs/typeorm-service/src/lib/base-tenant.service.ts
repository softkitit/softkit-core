import { BaseTenantEntityHelper, BaseTenantRepository } from '@softkit/typeorm';
import { BaseEntityService } from './base.service';

export class BaseTenantEntityService<
  ENTITY extends BaseTenantEntityHelper,
  ID extends keyof ENTITY,
  REPOSITORY extends BaseTenantRepository<ENTITY, ID>,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY,
  DEFAULT_EXCLUDE_LIST extends BaseTenantEntityHelper = BaseTenantEntityHelper,
> extends BaseEntityService<
  ENTITY,
  ID,
  REPOSITORY,
  FIELDS_REQUIRED_FOR_UPDATE,
  DEFAULT_EXCLUDE_LIST
> {}
