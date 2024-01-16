import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JobExecution } from '../entity';
import { BaseJobData } from '../service/vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobExecutionRepository extends BaseRepository<
  JobExecution<BaseJobData>
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(JobExecution, ds);
  }
}
