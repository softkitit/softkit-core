import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../database/entities';
import { BaseRepository } from '@saas-buildkit/typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(User, ds);
  }
}
