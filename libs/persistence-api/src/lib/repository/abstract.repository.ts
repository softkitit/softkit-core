import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Never } from '@softkit/common-types';
import { LimitOptions } from './vo/limit-options.interface';
import { BaseEntity } from '../entity/base.entity';

export abstract class AbstractRepository<
  ENTITY extends BaseEntity,
  ID extends keyof ENTITY,
  FIND_OPTIONS,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = keyof BaseEntity | ID,
> {
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
   * create entity if it already exists -> throw error
   * */
  abstract create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>,
  ): Promise<ENTITY>;

  abstract create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >,
  ): Promise<Array<ENTITY>>;

  /**
   * update entity if it doesn't exists -> throw error
   * */
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

  /**
   * update entity partial if it doesn't exist -> throw error
   * */
  abstract updatePartial(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<Partial<ENTITY>>;

  abstract updatePartial(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<Partial<ENTITY>>>;

  /**
   * */
  abstract updateByQuery(
    data: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>,
    query: FIND_OPTIONS,
  ): Promise<number>;

  abstract count(query?: FIND_OPTIONS): Promise<number>;

  abstract findAll(
    query?: FIND_OPTIONS,
    limitOptions?: LimitOptions,
  ): Promise<ENTITY[]>;

  // todo replace to use generalized types to do not belong to any specific orm, now it bind to the typeorm
  abstract findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
  ): Promise<Paginated<ENTITY>>;

  abstract findById(id: ENTITY[ID]): Promise<ENTITY | undefined>;
  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;
  abstract findOne(where: FIND_OPTIONS): Promise<ENTITY | undefined>;

  abstract delete(criteria: ENTITY[ID]): Promise<boolean>;
  abstract delete(criteria: Array<ENTITY[ID]>): Promise<boolean>;

  /**
   * usually it's just a class name, but it can be a table name or any other entity identifier, useful for i18n keys
   * */
  abstract entityName(): string;

  /**
   * Used for auto filter population, useful for permission systems, global filters for security like by tenant id,
   * or any other creative filters
   * */
  protected presetWhereOptions(criteria: FIND_OPTIONS): FIND_OPTIONS {
    return criteria;
  }
}
