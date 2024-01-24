import { BaseEntityService } from '../../../lib/base.service';
import { EntityWithEmbeddedId } from '../entity/entity-with-embedded-id';
import { EmbeddedRepository } from '../repository/embedded.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddedService extends BaseEntityService<
  EntityWithEmbeddedId,
  'id',
  EmbeddedRepository
> {
  constructor(repository: EmbeddedRepository) {
    super(repository);
  }
}
