import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SAMLConfiguration } from '../../database/entities';
import { BaseRepository } from '@softkit/typeorm';

@Injectable()
export class SamlConfigurationBaseRepository extends BaseRepository<SAMLConfiguration> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(SAMLConfiguration, ds);
  }
}
