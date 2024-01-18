import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(UserEntity, ds, 'id');
  }
}
