import { BaseTypeormTrackedEntityRepository } from '@softkit/typeorm';
import { EntityWithEmbeddedId } from '../entity/entity-with-embedded-id';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EmbeddedRepository extends BaseTypeormTrackedEntityRepository<
  EntityWithEmbeddedId,
  'id'
> {
  constructor(dataSource: DataSource) {
    super(EntityWithEmbeddedId, dataSource, 'id');
  }
}
