import { BaseRepository } from '@softkit/typeorm';
import { DataSource } from 'typeorm';
import { Job } from '../entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobRepository extends BaseRepository<Job> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(Job, ds);
  }
}
