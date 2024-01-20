import { Injectable } from '@nestjs/common';
import { AbstractJobVersionService } from './abstract-job-version.service';
import { JobVersionRepository } from '../repository/job-version.repository';
import { BaseJobVersion } from '../entity';

@Injectable()
export class JobVersionService extends AbstractJobVersionService {
  constructor(repository: JobVersionRepository) {
    super(repository);
  }

  override findJobVersionByJobDefinitionIdAndVersion(
    jobDefinitionId: string,
    jobVersion: number,
  ): Promise<BaseJobVersion | null> {
    return this.repository.findOne({
      where: {
        jobDefinitionId,
        jobVersion,
      },
    });
  }
}
