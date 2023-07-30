import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomUserRole } from '../../database/entities';
import { BaseRepository } from '@saas-buildkit/typeorm';

@Injectable()
export class CustomUserRoleRepository extends BaseRepository<CustomUserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(CustomUserRole, ds);
  }
}
