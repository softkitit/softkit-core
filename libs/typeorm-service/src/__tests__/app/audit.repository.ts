import { Injectable } from '@nestjs/common';
import { AuditEntity } from './audit.entity';
import { BaseRepository } from '@softkit/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditRepository extends BaseRepository<AuditEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(AuditEntity, ds);
  }
}
