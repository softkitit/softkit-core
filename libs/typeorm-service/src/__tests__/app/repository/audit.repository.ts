import { Injectable } from '@nestjs/common';
import { AuditEntity } from '../entity/audit.entity';
import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditRepository extends BaseRepository<AuditEntity, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(AuditEntity, ds, 'id');
  }
}
