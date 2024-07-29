import { EntityWithEmbeddedId } from '../entity/entity-with-embedded-id';
import { EmbeddedRepository } from '../repository/embedded.repository';
import { Injectable } from '@nestjs/common';
import { BaseTrackedEntityService } from '../../../lib/base-tracked-entity.service';
import { BaseTrackedEntityHelper } from '@softkit/typeorm';

@Injectable()
export class EmbeddedService extends BaseTrackedEntityService<
  EntityWithEmbeddedId,
  'id',
  EmbeddedRepository,
  'id',
  keyof BaseTrackedEntityHelper
> {
  constructor(repository: EmbeddedRepository) {
    super(repository);
  }
}
