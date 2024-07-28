import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseJobExecution, JobExecution } from '../entity';
import { Injectable, Optional } from '@nestjs/common';
import {
  BaseTrackedEntityHelper,
  BaseTypeormTrackedEntityRepository,
} from '@softkit/typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';

@Injectable()
export class JobExecutionRepository<
  ENTITY extends BaseJobExecution = JobExecution,
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
    super(entityTarget || JobExecution, ds, idFieldName || ('id' as ID));
  }
}
