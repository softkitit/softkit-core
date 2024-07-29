import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';
import {
  BaseTrackedEntityHelper,
  BaseTypeormTrackedEntityRepository,
} from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseTypeormTrackedEntityRepository<
  UserEntity,
  'id',
  'id' | 'version',
  keyof BaseTrackedEntityHelper | 'version'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(UserEntity, ds, 'id');
  }
}
