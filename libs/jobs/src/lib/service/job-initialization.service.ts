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

    const counters = {
      success: 0,
      failed: 0,
    };

    for (const job of jobs || []) {
      try {
        await this.schedulingJobService.scheduleSystemJob(job);
        counters.success++;
      } catch (error) {
        counters.failed++;
        this.logger.error(
          `Can not schedule a job: ${job.name}. Job Data: ${JSON.stringify(
            job,
          )}. ${error}`,
        );
      }
    }

    this.logger.log(`All system jobs scheduled: ${JSON.stringify(counters)}`);

    if (counters.success === 0) {
      throw new Error(
        `All system job failed to start that suspicious and better to do not start the app. ${counters.failed} - failed`,
      );
    }
  }
}
