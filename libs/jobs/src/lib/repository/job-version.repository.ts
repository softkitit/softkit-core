import { BaseRepository } from '@softkit/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseJobVersion, JobVersion } from '../entity';

@Injectable()
export class JobVersionRepository<
  T extends BaseJobVersion = JobVersion,
> extends BaseRepository<T, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(JobVersion, ds, 'id');
  }
}
