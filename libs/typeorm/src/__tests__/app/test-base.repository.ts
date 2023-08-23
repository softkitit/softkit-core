import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../lib/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TestBaseEntity } from './test-base.entity';

@Injectable()
export class TestBaseRepository extends BaseRepository<TestBaseEntity> {
  constructor(
    @InjectDataSource()
    private ds: DataSource,
  ) {
    super(TestBaseEntity, ds);
  }
}
