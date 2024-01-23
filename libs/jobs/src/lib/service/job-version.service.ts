import { Injectable } from '@nestjs/common';
import { AbstractJobVersionService } from './abstract/abstract-job-version.service';
import { JobVersionRepository } from '../repository';
import { BaseJobVersion } from '../entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class JobVersionService extends AbstractJobVersionService {
  constructor(repository: JobVersionRepository) {
    super(repository);
  }

  @Transactional()
  override findJobVersionByJobDefinitionIdAndVersion(
    jobDefinitionId: string,
    jobVersion: number,
  ): Promise<BaseJobVersion | undefined> {
    return this.findOne(
      {
        where: {
          jobDefinitionId,
          jobVersion,
        },
      },
      false,
    );
  }

  @Transactional()
  override findLatestJobVersion(
    jobDefinitionId: string,
  ): Promise<BaseJobVersion> {
    return this.findOne({
      where: {
        jobDefinitionId,
      },
      order: {
        jobVersion: 'DESC',
      },
    });
  }
}
