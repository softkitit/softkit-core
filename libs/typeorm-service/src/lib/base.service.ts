import { DeepPartial, FindOneOptions, FindOptionsOrder } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { BaseEntityHelper, BaseRepository } from '@softkit/typeorm';
import { AbstractBaseService } from './abstract-base.service';
import { toCapitalizedWords } from '@softkit/string-utils';
import { ObjectNotFoundException } from '@softkit/exceptions';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { map } from '@softkit/validation';
import { Never } from '@softkit/common-types';

export class BaseEntityService<
  ENTITY extends BaseEntityHelper,
  ID extends keyof ENTITY,
  REPOSITORY extends BaseRepository<ENTITY, ID>,
  FIELDS_REQUIRED_FOR_UPDATE = Pick<ENTITY, ID>,
  DEFAULT_EXCLUDE_LIST extends BaseEntityHelper = BaseEntityHelper,
> extends AbstractBaseService<
  ENTITY,
  ID,
  FIELDS_REQUIRED_FOR_UPDATE,
  DEFAULT_EXCLUDE_LIST
> {
  protected entityFriendlyName: string;

  constructor(protected readonly repository: REPOSITORY) {
    super();
    this.entityFriendlyName = toCapitalizedWords(repository.metadata.tableName);
  }

  @Transactional()
  override async partialUpdate(
    entity: DeepPartial<Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST>> &
      Pick<ENTITY, ID>,
  ) {
    return await this.repository.save({
      ...entity,
    } as unknown as DeepPartial<ENTITY>);
  }

  @Transactional()
  override async findOne(
    findOptions: FindOneOptions<ENTITY>,
    throwExceptionIfNotFound = true,
  ): Promise<ENTITY | undefined> {
    const result = await this.repository.findOne(findOptions);

    if (result === null && throwExceptionIfNotFound) {
      throw new ObjectNotFoundException(this.entityFriendlyName);
    }

    return result ?? undefined;
  }

  @Transactional()
  override async createOrUpdateEntity(
    entity:
      | (Omit<
          ENTITY,
          keyof DEFAULT_EXCLUDE_LIST | keyof FIELDS_REQUIRED_FOR_UPDATE
        > &
          Partial<Never<FIELDS_REQUIRED_FOR_UPDATE>>)
      | (Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST> & FIELDS_REQUIRED_FOR_UPDATE),
  ) {
    return this.repository.createOrUpdate(
      entity as unknown as DeepPartial<ENTITY>,
    );
  }

  @Transactional()
  override async createOrUpdateEntities(
    entities:
      | (Omit<
          ENTITY,
          keyof DEFAULT_EXCLUDE_LIST | keyof FIELDS_REQUIRED_FOR_UPDATE
        > &
          Partial<Never<FIELDS_REQUIRED_FOR_UPDATE>>)[]
      | (Omit<ENTITY, keyof DEFAULT_EXCLUDE_LIST> &
          FIELDS_REQUIRED_FOR_UPDATE)[],
  ) {
    return this.repository.save(entities as unknown as DeepPartial<ENTITY>[]);
  }

  @Transactional()
  override async findOneById(id: ENTITY[ID], throwExceptionIfNotFound = true) {
    const result = await this.repository.findSingle(id);

    if (throwExceptionIfNotFound && !result) {
      throw new ObjectNotFoundException(this.entityFriendlyName);
    }

    return result ?? undefined;
  }

  @Transactional()
  override async findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
  ): Promise<Paginated<ENTITY>> {
    return this.repository.findAllPaginated(query, config);
  }

  @Transactional()
  override async findAll(
    page = 1,
    limit = 20,
    order?: FindOptionsOrder<ENTITY>,
  ): Promise<ENTITY[]> {
    return this.repository.find({
      take: limit,
      skip: (page - 1) * limit,
      order: order,
    });
  }

  @Transactional()
  override async findAllPaginatedAndTransform<T>(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
    clazz: ClassConstructor<T>,
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    options?: ClassTransformOptions,
  ): Promise<Paginated<T>> {
    return this.repository.findAllPaginated(query, config).then((paginated) => {
      const data = map(paginated.data, clazz, options);
      return {
        ...paginated,
        data,
      } as never as Paginated<T>;
    });
  }

  @Transactional()
  override async archive(id: ENTITY[ID], version: number): Promise<boolean> {
    return this.repository.archive(id, version);
  }

  @Transactional()
  override async unarchive(id: ENTITY[ID], version: number): Promise<boolean> {
    return this.repository.unarchive(id, version);
  }

  @Transactional()
  override async delete(id: ENTITY[ID]): Promise<boolean> {
    const deleteResult = await this.repository.deleteById(id);
    return deleteResult.affected === 1;
  }
}
