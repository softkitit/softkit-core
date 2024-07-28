import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { Never } from '@softkit/common-types';
import { BaseEntity } from '@softkit/persistence-api';

export abstract class AbstractBaseService<
  ENTITY extends BaseEntity,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof BaseEntity,
> {
  abstract update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<ENTITY>;

  abstract update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<ENTITY>>;

  abstract create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>,
  ): Promise<ENTITY>;

  abstract create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >,
  ): Promise<Array<ENTITY>>;

  abstract upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY>;

  abstract upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >,
  ): Promise<ENTITY[]>;

  /**
   * update entity partial if it doesn't exist -> throw error
   * */
  abstract partialUpdate(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<Partial<ENTITY>>;

  abstract partialUpdate(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<Partial<ENTITY>>>;

  abstract findAll(page: number, limit: number): Promise<ENTITY[]>;

  abstract findById(
    id: ENTITY[ID],
    throwExceptionIfNotFound: true,
  ): Promise<ENTITY>;
  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  abstract findById(
    id: ENTITY[ID],
    throwExceptionIfNotFound: false,
  ): Promise<ENTITY | undefined>;

  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  abstract findAllPaginated<T = ENTITY>(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
    clazz?: ClassConstructor<T>,
    options?: ClassTransformOptions,
  ): Promise<Paginated<T>>;

  abstract delete(id: ENTITY[ID]): Promise<boolean>;
}
