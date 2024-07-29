import {
  AbstractRepository,
  BaseTrackedEntity,
  ITrackedRepository,
} from '@softkit/persistence-api';
import { BaseEntityService } from './base-entity.service';

export class BaseTrackedEntityService<
  ENTITY extends BaseTrackedEntity,
  ID extends keyof ENTITY,
  REPOSITORY extends ITrackedRepository<ENTITY, ID, unknown> &
    AbstractRepository<
      ENTITY,
      ID,
      unknown,
      FIELDS_REQUIRED_FOR_UPDATE,
      AUTO_GENERATED_FIELDS
    >,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof BaseTrackedEntity,
> extends BaseEntityService<
  ENTITY,
  ID,
  REPOSITORY,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  constructor(repository: REPOSITORY) {
    super(repository);
  }

  archive(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    // eslint-disable-next-line sonarjs/no-all-duplicated-branches
    return Array.isArray(id)
      ? this.repository.archive(id)
      : this.repository.archive(id);
  }

  restore(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    // eslint-disable-next-line sonarjs/no-all-duplicated-branches
    return Array.isArray(id)
      ? this.repository.restore(id)
      : this.repository.restore(id);
  }
}
