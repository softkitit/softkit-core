import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(UserRole, ds);
  }
}
