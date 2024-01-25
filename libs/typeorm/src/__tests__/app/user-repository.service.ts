import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../lib/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, 'id'> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    super(UserEntity, dataSource, 'id');
  }
}
