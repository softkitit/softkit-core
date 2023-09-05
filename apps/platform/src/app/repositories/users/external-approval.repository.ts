import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ExternalApproval } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class ExternalApprovalsRepository extends BaseRepository<ExternalApproval> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(ExternalApproval, ds);
  }
}
