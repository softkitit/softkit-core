import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DefaultRole } from '../../database/entities';
import { BaseRepository } from "@saas-buildkit/typeorm";

@Injectable()
export class DefaultRoleRepository extends BaseRepository<DefaultRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(DefaultRole, ds);
  }
}
