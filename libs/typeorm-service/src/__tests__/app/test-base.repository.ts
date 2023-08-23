import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@saas-buildkit/typeorm';
import { TestBaseEntity } from './test-base.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestBaseRepository extends BaseRepository<TestBaseEntity> {
  constructor(
    @InjectDataSource()
    private ds: DataSource,
  ) {
    super(TestBaseEntity, ds);
  }
}
