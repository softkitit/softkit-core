import { Injectable } from '@nestjs/common';
import { AbstractJobVersionService } from './abstract/abstract-job-version.service';
import { JobVersionRepository } from '../repository';
import { BaseJobVersion } from '../entity';
import { Transactional } from 'typeorm-transactional';
import { LessThan } from 'typeorm';
import { ObjectNotFoundException } from '@softkit/exceptions';

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
    return this.repository.findOne({
      jobDefinitionId,
      jobVersion,
    });
  }

  @Transactional()
  override async findPreviousJobVersion(
    jobDefinitionId: string,
    newJobVersion: number,
  ): Promise<BaseJobVersion | undefined> {
    return this.repository.findOne({
      jobDefinitionId,
      jobVersion: LessThan(newJobVersion),
    });
  }

  @Transactional()
  override async findLatestJobVersion(
    jobDefinitionId: string,
  ): Promise<BaseJobVersion> {
    const result = await this.repository.findOne({
      jobDefinitionId,
    });

    if (!result) {
      throw new ObjectNotFoundException(this.repository.entityName());
    }

    return result;
  }
}
