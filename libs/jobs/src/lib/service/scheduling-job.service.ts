import { Inject, Injectable, Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull-shared/dist/utils/get-queue-token.util';
import { ModuleRef } from '@nestjs/core';
import { Queue, RepeatableJob } from 'bullmq';
import equal from 'fast-deep-equal';
import { BaseJobData } from './vo';
import { Propagation, Transactional } from 'typeorm-transactional';
import { IJobService } from './job.interface';
import { BaseJobEntity } from '../entity';
import { ISchedulingJobService } from './scheduling-job.interface';
import { JOB_SERVICE_TOKEN } from '../constants';
import { SystemJobConfig } from '../config/system-job.config';

@Injectable()
export class SchedulingJobService
  implements ISchedulingJobService<BaseJobData>
{
  protected readonly logger = new Logger(SchedulingJobService.name);

  /**
   * Page size for fetching repeatable jobs
   * */
  protected readonly MAX_REPEATABLE_JOBS_FETCH = 100;

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService<BaseJobEntity<BaseJobData>>,
  ) {}

  @Transactional({
    propagation: Propagation.REQUIRES_NEW,
  })
  public async scheduleSystemJob(
    systemJobConfig: SystemJobConfig<BaseJobData>,
  ) {
    this.logger.log(`Start scheduling system job ${systemJobConfig.name}`);

    const job = await this.jobService.getLatestJobVersionByName(
      systemJobConfig.name,
    );

    const queue = this.moduleRef.get<Queue>(
      getQueueToken(systemJobConfig.name),
      // To retrieve a provider from the global context pass the { strict: false } option as a second argument to get().
      { strict: false },
    );

    const repeatableJobsForQueue = await this.getRepeatableJobs(queue);

    this.validateSystemJobs(repeatableJobsForQueue);

    const scheduleJob: RepeatableJob | undefined = repeatableJobsForQueue[0];

    await this.checkAndRescheduleJobs(scheduleJob, systemJobConfig, job, queue);
  }

  private async getRepeatableJobs(queue: Queue) {
    return await queue.getRepeatableJobs(
      0,
      this.MAX_REPEATABLE_JOBS_FETCH,
      true,
    );
  }

  private validateSystemJobs(repeatableJobs: RepeatableJob[]) {
    if (repeatableJobs.length > 1) {
      const errorMessage = `Only one repeatable job is allowed per queue for system jobs, there is some misconfiguration that require manual fix. All repeatable jobs: ${JSON.stringify(
        repeatableJobs,
      )}`;

      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // eslint-disable-next-line complexity
  private async checkAndRescheduleJobs(
    scheduleJob: RepeatableJob | undefined,
    systemJobConfig: SystemJobConfig<BaseJobData>,
    job: BaseJobEntity<BaseJobData> | null,
    queue: Queue,
  ) {
    const patternChanged = scheduleJob?.pattern !== systemJobConfig.cron;
    const jobDataChanged =
      !job || !equal(job?.jobData, systemJobConfig.jobData);

    // removing a job if data or cron changed
    if (patternChanged || jobDataChanged || !job) {
      if (!job && scheduleJob) {
        this.logger.warn(
          `System job ${systemJobConfig.name} was not found in database, but found in redis as a repeatable job`,
        );
      }

      if (scheduleJob) {
        await queue.removeRepeatableByKey(scheduleJob.key);
      }

      await this.rescheduleJob(systemJobConfig, job, queue);
    } else {
      this.logger.log(
        `System job ${systemJobConfig.name} is already scheduled and not changed`,
      );
    }
  }

  private async rescheduleJob(
    systemJobConfig: SystemJobConfig<BaseJobData>,
    job: BaseJobEntity<BaseJobData> | null,
    queue: Queue,
  ) {
    const scheduledJob = await queue.add(
      systemJobConfig.name,
      systemJobConfig.jobData,
      {
        jobId: systemJobConfig.name,
        repeat: {
          pattern: systemJobConfig.cron,
        },
      },
    );

    const savedJob = await this.jobService.saveJob({
      name: systemJobConfig.name,
      jobData: systemJobConfig.jobData,
      jobVersion: (job?.jobVersion ?? 0) + 1,
      pattern: systemJobConfig.cron,
      jobOptions: scheduledJob.opts,
    });

    this.logger.log(
      `System job ${systemJobConfig.name} is scheduled with id ${scheduledJob.id}, and saved to db: ${savedJob?.id}`,
    );
  }
}
