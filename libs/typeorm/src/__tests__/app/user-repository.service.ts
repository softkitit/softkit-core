import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseTrackedEntityHelper } from '../../lib/entity/entity-helper';
import { BaseTypeormTrackedEntityRepository } from '../../lib/repositories/base-typeorm-tracked-entity.repository';

@Injectable()
export class UserRepository extends BaseTypeormTrackedEntityRepository<
  UserEntity,
  'id',
  'id' | 'version',
  'id' | 'version' | keyof BaseTrackedEntityHelper
> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    super(UserEntity, dataSource, 'id');
  }
}
