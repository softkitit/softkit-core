import { DataSource } from 'typeorm';
import { Injectable, Optional } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseJobVersion, JobVersion } from '../entity';
import {
  BaseTrackedEntityHelper,
  BaseTypeormTrackedEntityRepository,
} from '@softkit/typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';

@Injectable()
export class JobVersionRepository<
  ENTITY extends BaseJobVersion = JobVersion,
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
    super(entityTarget || JobVersion, ds, idFieldName || ('id' as ID));
  }
}
