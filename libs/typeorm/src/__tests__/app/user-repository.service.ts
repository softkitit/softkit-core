import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../lib/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectDataSource()
    private ds: DataSource,
  ) {
    super(UserEntity, ds);
  }
}
