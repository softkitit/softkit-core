import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { AbstractSchedulingJobService } from './abstract-scheduling-job.service';
import { JobsConfig } from '../config';
import { JOBS_CONFIG_TOKEN } from '../constants';

@Injectable()
export class JobInitializationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(JobInitializationService.name);

  constructor(
    private readonly schedulingJobService: AbstractSchedulingJobService,
    @Inject(JOBS_CONFIG_TOKEN)
    private readonly jobConfig: JobsConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    //   todo redis lock
    const jobs = this.jobConfig.systemJobs?.jobs;
    if (!jobs?.length) {
      this.logger.log(`No system job provided, nothing to schedule`);
      return;
    }

    this.logger.log(`Start scheduling ${jobs?.length || 0} system jobs`);

    for (const job of jobs || []) {
      await this.schedulingJobService.scheduleSystemJob(job);
    }

    this.logger.log(`All system jobs scheduled: ${jobs.length}`);
  }
}
