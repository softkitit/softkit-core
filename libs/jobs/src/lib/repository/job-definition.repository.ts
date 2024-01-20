import { BaseRepository } from '@softkit/typeorm';
import { DataSource } from 'typeorm';
import { BaseJobDefinitionEntity, JobDefinition } from '../entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobDefinitionRepository<
  T extends BaseJobDefinitionEntity = JobDefinition,
> extends BaseRepository<T, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(JobDefinition, ds, 'id');
  }
}
