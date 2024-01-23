import { Injectable } from '@nestjs/common';
import { JobDefinitionRepository } from '../repository';
import { AbstractJobDefinitionService } from './abstract/abstract-job-definition.service';

@Injectable()
export class JobDefinitionService extends AbstractJobDefinitionService {
  constructor(repository: JobDefinitionRepository) {
    super(repository);
  }
}
