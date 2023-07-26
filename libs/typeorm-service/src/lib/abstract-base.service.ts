import { FindOneOptions, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { BaseEntityHelper } from '@saas-buildkit/typeorm';
import { InfinityPaginationResultType } from '@saas-buildkit/common-types';

export abstract class AbstractBaseService<
  ENTITY extends BaseEntityHelper,
  EXCLUDE_FIELDS_FOR_SAVE_TYPE,
> {
  abstract createOrUpdateEntity(
    entity: // update type
    | Omit<ENTITY, keyof Omit<EXCLUDE_FIELDS_FOR_SAVE_TYPE, 'version'>>
      // insert type
      | Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE | 'id' | 'version'>,
  ): Promise<ENTITY>;

  abstract createOrUpdateEntities(
    entity: // update type
    | Omit<ENTITY, keyof Omit<EXCLUDE_FIELDS_FOR_SAVE_TYPE, 'version'>>[]
      // insert type
      | Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE | 'id' | 'version'>[],
  ): Promise<ENTITY[]>;

  abstract findOneById(
    id: ENTITY['id'],
    throwExceptionIfNotFound: boolean,
  ): Promise<ENTITY | undefined>;

  protected abstract findOne(
    findOptions: FindOneOptions<ENTITY>,
    throwExceptionIfNotFound: boolean,
  ): Promise<ENTITY | undefined>;

  abstract findAll(
    where: FindOptionsWhere<ENTITY>,
    page: number,
    limit: number,
    sort?: FindOptionsOrder<ENTITY>,
  ): Promise<InfinityPaginationResultType<ENTITY>>;

  abstract archive(id: ENTITY['id'], version: number): Promise<boolean>;

  abstract unarchive(id: ENTITY['id'], version: number): Promise<boolean>;

  abstract delete(id: ENTITY['id']): Promise<boolean>;
}
