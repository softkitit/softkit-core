import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PermissionCategory } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class PermissionCategoryRepository extends BaseRepository<PermissionCategory> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(PermissionCategory, ds);
  }
}
