import { Injectable } from '@nestjs/common';
import { JobExecutionRepository } from '../repository';
import { AbstractJobExecutionService } from './abstract/abstract-job-execution.service';

@Injectable()
export class JobExecutionService extends AbstractJobExecutionService {
  constructor(repository: JobExecutionRepository) {
    super(repository);
  }
}
