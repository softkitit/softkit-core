import { Injectable } from '@nestjs/common';
import { AbstractJobVersionService } from './abstract/abstract-job-version.service';
import { JobVersionRepository } from '../repository';
import { BaseJobVersion } from '../entity';
import { Transactional } from 'typeorm-transactional';
import { LessThan } from 'typeorm';

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
  override findPreviousJobVersion(
    jobDefinitionId: string,
    newJobVersion: number,
  ): Promise<BaseJobVersion | undefined> {
    return this.findOne(
      {
        where: {
          jobDefinitionId,
          jobVersion: LessThan(newJobVersion),
        },
        order: {
          jobVersion: 'DESC',
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
