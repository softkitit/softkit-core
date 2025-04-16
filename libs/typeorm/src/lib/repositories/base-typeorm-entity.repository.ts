import { Logger } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { EntityHelper } from '../entity/entity-helper';
import { AbstractRepository, LimitOptions } from '@softkit/persistence-api';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Never } from '@softkit/common-types';
import {
  paginate,
  PaginateConfig,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { ObjectType } from 'typeorm/common/ObjectType';

export abstract class BaseTypeormEntityRepository<
  ENTITY extends EntityHelper,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof EntityHelper,
> extends AbstractRepository<
  ENTITY,
  ID,
  FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  protected readonly logger: Logger = new Logger(this.constructor.name);
  protected typeormRepository: Repository<ENTITY>;

  protected constructor(
    protected entityTarget: ObjectType<ENTITY>,
    protected dataSource: DataSource,
    protected idFieldName: ID,
  ) {
    super();
    this.typeormRepository = dataSource.getRepository(entityTarget);
  }

  override count(
    query: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>> = {},
  ): Promise<number> {
    return this.typeormRepository.countBy(this.presetWhereOptions(query));
  }

  override findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
  ): Promise<Paginated<ENTITY>> {
    const queryBuilder = this.typeormRepository.createQueryBuilder();

    const where = this.presetWhereOptions({});
    if (Object.keys(where).length > 0) {
      queryBuilder.where(where);
    }

    return paginate(query, queryBuilder, config);
  }

  findById(id: ENTITY[ID]): Promise<ENTITY | undefined>;
  findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  override findById(
    ids: ENTITY[ID] | Array<ENTITY[ID]>,
  ): Promise<ENTITY | undefined | Array<ENTITY>> {
    const isArray = Array.isArray(ids);
    const where = this.presetWhereOptions({
      [this.idFieldName]: isArray ? In(ids) : ids,
    } as FindOptionsWhere<ENTITY>);

    return isArray
      ? this.typeormRepository.find({
          where,
        })
      : this.typeormRepository.findOneBy(where).then((entity) => {
          if (entity === null) {
            return;
          }
          return entity;
        });
  }

  override findOne(
    where: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
  ): Promise<ENTITY | undefined> {
    return this.typeormRepository
      .findOneBy(this.presetWhereOptions(where))
      .then((v) => {
        if (v === null) {
          return;
        }
        return v;
      });
  }

  delete(id: ENTITY[ID]): Promise<boolean>;
  delete(id: Array<ENTITY[ID]>): Promise<boolean>;

  override async delete(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    const condition = Array.isArray(id)
      ? { [this.idFieldName]: In(id) }
      : { [this.idFieldName]: id };

    const where = this.presetWhereOptions(
      condition as FindOptionsWhere<ENTITY>,
    ) as FindOptionsWhere<ENTITY>;

    const deleteResult = await this.typeormRepository.delete(where);

    return Array.isArray(id)
      ? deleteResult.affected === id.length
      : deleteResult.affected! > 0;
  }

  override findAll(
    query?: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    limitOptions: LimitOptions = {
      limit: 100,
      offset: 0,
    },
  ): Promise<ENTITY[]> {
    return this.typeormRepository.find({
      where: this.presetWhereOptions(query || {}),
      take: limitOptions.limit,
      skip: limitOptions.offset,
    });
  }

  override async updateByQuery(
    fields: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>,
    query: FindOptionsWhere<ENTITY>,
  ): Promise<number> {
    const result = await this.typeormRepository.update(
      this.presetWhereOptions(query) as FindOptionsWhere<ENTITY>,
      fields as unknown as QueryDeepPartialEntity<ENTITY>,
    );

    // can't reproduce the behaviour where affected is not present in the result because in postgres it always returned
    /* istanbul ignore next */
    return result.affected ?? 0;
  }

  updatePartial(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<Partial<ENTITY>>;

  updatePartial(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<Partial<ENTITY>>>;

  override async updatePartial(
    entities:
      | (Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
      | Array<
          Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >,
  ): Promise<Partial<ENTITY> | Array<Partial<ENTITY>>> {
    return this.save(entities);
  }

  upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY>;

  upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >,
  ): Promise<ENTITY[]>;

  override async upsert(
    entities:
      | Array<
          | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
              Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
          | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
              Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
        >
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entities);
  }

  create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>,
  ): Promise<ENTITY>;

  create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >,
  ): Promise<Array<ENTITY>>;

  override create(
    entities:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>)
      | Array<Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>>,
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entities);
  }

  /**
   * update entity if it doesn't exists -> throw error
   * */
  update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<ENTITY>;

  update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<ENTITY>>;

  override update(
    entity:
      | Array<
          Omit<ENTITY, AUTO_GENERATED_FIELDS> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entity);
  }

  override entityName(): string {
    return this.entityTarget.name;
  }

  protected async save(entities: unknown): Promise<ENTITY | ENTITY[]> {
    const toSave = Array.isArray(entities) ? entities : [entities];

    const saved = await this.typeormRepository.save(
      this.typeormRepository.create(toSave as DeepPartial<ENTITY>[]),
    );

    return Array.isArray(entities) ? saved : saved[0];
  }
}
