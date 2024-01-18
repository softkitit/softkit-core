import { DeepPartial, FindOneOptions, FindOptionsOrder } from 'typeorm';
import { BaseEntityHelper } from '@softkit/typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { Never } from '@softkit/common-types';

export abstract class AbstractBaseService<
  ENTITY extends BaseEntityHelper,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE,
  DEFAULT_EXCLUDE_LIST extends BaseEntityHelper,
> {
  abstract createOrUpdateEntity(
    entity: // update type
    | (Omit<
          ENTITY,
          keyof DEFAULT_EXCLUDE_LIST | keyof FIELDS_REQUIRED_FOR_UPDATE
        > &
          Never<FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Pick<ENTITY, ID>>)
      | (Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST> & FIELDS_REQUIRED_FOR_UPDATE),
  ): Promise<ENTITY>;

  abstract createOrUpdateEntities(
    entity: // update type
    | (Omit<
          ENTITY,
          keyof DEFAULT_EXCLUDE_LIST | keyof FIELDS_REQUIRED_FOR_UPDATE
        > &
          Partial<Never<FIELDS_REQUIRED_FOR_UPDATE>>)[]
      | (Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST> &
          FIELDS_REQUIRED_FOR_UPDATE)[],
  ): Promise<ENTITY[]>;

  abstract partialUpdate(
    entity: DeepPartial<Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST>>,
  ): Promise<DeepPartial<ENTITY>>;

  abstract findAll(
    page: number,
    limit: number,
    order?: FindOptionsOrder<ENTITY>,
  ): Promise<ENTITY[]>;

  abstract findOneById(
    id: ENTITY[ID],
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

  abstract archive(id: ENTITY[ID], version: number): Promise<boolean>;

  abstract unarchive(id: ENTITY[ID], version: number): Promise<boolean>;

  abstract delete(id: ENTITY[ID]): Promise<boolean>;
}
