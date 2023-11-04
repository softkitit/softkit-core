import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserProfile } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserProfile> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(UserProfile, ds);
  }
}
