import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Permission } from '../../database/entities';
import { BaseRepository } from "@saas-buildkit/typeorm";

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(Permission, ds);
  }
}
