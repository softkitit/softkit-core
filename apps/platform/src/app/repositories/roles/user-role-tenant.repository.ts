import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';
import { ClsService } from 'nestjs-cls';
import { ClsStore } from '../../common/vo/cls-store';

@Injectable()
export class UserRoleTenantRepository extends BaseRepository<UserRole> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    private clsService: ClsService<ClsStore>,
  ) {
    super(UserRole, ds);
  }
}
