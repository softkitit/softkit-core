import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '@softkit/typeorm-service';
import { BaseJobEntity } from '../entity';
import { BaseJobData } from './vo';
import { JobRepository } from '../repository';
import { IJobService } from './job.interface';
import { Transactional } from 'typeorm-transactional';
import { BaseEntityHelper } from '@softkit/typeorm';

@Injectable()
export class JobService
  extends BaseEntityService<BaseJobEntity<BaseJobData>, JobRepository>
  implements IJobService<BaseJobEntity<BaseJobData>>
{
  constructor(repository: JobRepository) {
    super(repository);
  }

  @Transactional()
  public async getLatestJobVersionByName(
    name: string,
  ): Promise<BaseJobEntity<BaseJobData> | null> {
    return this.repository.findOne({
      where: {
        name,
      },
      order: {
        jobVersion: 'DESC',
      },
    });
  }

  @Transactional()
  public async saveJob(
    job: Omit<BaseJobEntity<BaseJobData>, keyof BaseEntityHelper> & {
      id?: never;
      version?: never;
    },
  ): Promise<BaseJobEntity<BaseJobData> | null> {
    return this.createOrUpdateEntity(job);
  }
}
