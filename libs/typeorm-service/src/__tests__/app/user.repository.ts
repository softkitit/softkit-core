import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { BaseRepository } from '@saas-buildkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(UserEntity, ds);
  }
}
