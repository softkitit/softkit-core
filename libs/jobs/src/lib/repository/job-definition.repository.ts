import {
  BaseTrackedEntityHelper,
  BaseTypeormTrackedEntityRepository,
} from '@softkit/typeorm';
import { DataSource } from 'typeorm';
import { BaseJobDefinitionEntity, JobDefinition } from '../entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable, Optional } from '@nestjs/common';
import { ObjectType } from 'typeorm/common/ObjectType';

@Injectable()
export class JobDefinitionRepository<
  ENTITY extends BaseJobDefinitionEntity = JobDefinition,
  ID extends keyof ENTITY = 'id',
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY =
    | keyof BaseTrackedEntityHelper
    | ID,
> extends BaseTypeormTrackedEntityRepository<
  ENTITY,
  ID,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    @Optional()
    entityTarget?: ObjectType<ENTITY>,
    @Optional()
    idFieldName?: ID,
  ) {
    super(entityTarget || JobDefinition, ds, idFieldName || ('id' as ID));
  }
}
