import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseJobExecution, JobExecution } from '../entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobExecutionRepository<
  T extends BaseJobExecution = JobExecution,
> extends BaseRepository<T, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(JobExecution, ds, 'id');
  }
}
