import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { AbstractSchedulingJobService } from './abstract/abstract-scheduling-job.service';
import { JobsConfig } from '../config';
import { JOBS_CONFIG_TOKEN } from '../constants';
import { runInTransaction } from 'typeorm-transactional';
import { RedlockService } from '@anchan828/nest-redlock';

@Injectable()
export class JobInitializationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(JobInitializationService.name);

  constructor(
    private readonly schedulingJobService: AbstractSchedulingJobService,
    @Inject(JOBS_CONFIG_TOKEN)
    private readonly jobConfig: JobsConfig,
    private readonly lockService: RedlockService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const jobs = this.jobConfig.systemJobs?.jobs;
    if (!jobs?.length) {
      this.logger.log(`No system job provided, nothing to schedule`);
      return;
    }

    this.logger.log(`Start scheduling ${jobs.length} system jobs`);

    const lockKey =
      this.jobConfig.applicationStartupLock ??
      `app-startup-` + this.jobConfig.prefix + `-lock`;

    await this.lockService.using(
      [lockKey],
      20_000,
      {
        retryCount: 10,
        retryDelay: 2000,
      },
      async () => {
        for (const job of jobs) {
          await runInTransaction(async () => {
            await this.schedulingJobService.scheduleSystemJob(job);
          });
        }
      },
    );

    this.logger.log(`All system jobs scheduled: ${jobs.length}`);
  }
}
