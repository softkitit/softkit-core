import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JobExecution } from '../entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobExecutionRepository extends BaseRepository<JobExecution> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(JobExecution, ds);
  }
}
