import { DeepPartial, FindOneOptions, FindOptionsOrder } from 'typeorm';
import { BaseEntityHelper } from '@softkit/typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';

export abstract class AbstractBaseService<
  ENTITY extends BaseEntityHelper,
  EXCLUDE_FIELDS_FOR_SAVE_TYPE,
> {
  abstract createOrUpdateEntity(
    entity: // update type
    | (Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE> & {
          id?: never;
          version?: never;
        })
      | (Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE> &
          Pick<ENTITY, 'id' | 'version'>),
  ): Promise<ENTITY>;

  abstract partialUpdate(
    id: ENTITY['id'],
    entity: // update type
    DeepPartial<ENTITY>,
  ): Promise<
    DeepPartial<ENTITY> & Pick<ENTITY, 'id' | 'updatedAt' | 'version'>
  >;

  abstract findAll(
    page: number,
    limit: number,
    order?: FindOptionsOrder<ENTITY>,
  ): Promise<ENTITY[]>;

  abstract createOrUpdateEntities(
    entity: // update type
    | (Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE> & {
          id?: never;
          version?: never;
        })[]
      | (Omit<ENTITY, keyof EXCLUDE_FIELDS_FOR_SAVE_TYPE> &
          Pick<ENTITY, 'id' | 'version'>)[],
  ): Promise<ENTITY[]>;

  abstract findOneById(
    id: ENTITY['id'],
    throwExceptionIfNotFound: boolean,
  ): Promise<ENTITY | undefined>;

  protected abstract findOne(
    findOptions: FindOneOptions<ENTITY>,
    throwExceptionIfNotFound: boolean,
  ): Promise<ENTITY | undefined>;

  abstract findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
  ): Promise<Paginated<ENTITY>>;

  abstract findAllPaginatedAndTransform<T>(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
    clazz: ClassConstructor<T>,
    options?: ClassTransformOptions,
  ): Promise<Paginated<T>>;

  abstract archive(id: ENTITY['id'], version: number): Promise<boolean>;

  abstract unarchive(id: ENTITY['id'], version: number): Promise<boolean>;

  abstract delete(id: ENTITY['id']): Promise<boolean>;
}
