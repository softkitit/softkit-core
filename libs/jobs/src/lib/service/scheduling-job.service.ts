import { Injectable, Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull-shared/dist/utils/get-queue-token.util';
import { ModuleRef } from '@nestjs/core';
import { Queue, RepeatableJob } from 'bullmq';
import equal from 'fast-deep-equal';
import { Propagation, Transactional } from 'typeorm-transactional';
import { AbstractSchedulingJobService } from './abstract-scheduling-job.service';
import { SystemJobConfig } from '../config/system-job.config';
import { AbstractJobDefinitionService } from './abstract-job-definition.service';
import { AbstractJobVersionService } from './abstract-job-version.service';
import { BaseJobVersion } from '../entity';

@Injectable()
export class SchedulingJobService implements AbstractSchedulingJobService {
  protected readonly logger = new Logger(SchedulingJobService.name);

  /**
   * Page size for fetching repeatable jobs
   * */
  protected readonly MAX_REPEATABLE_JOBS_FETCH = 100;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly jobDefinitionService: AbstractJobDefinitionService,
    private readonly jobVersionService: AbstractJobVersionService,
  ) {}

  @Transactional({
    propagation: Propagation.REQUIRES_NEW,
  })
  public async scheduleSystemJob(job: SystemJobConfig) {
    this.logger.log(`Start scheduling system job ${job.name}`);

    const jobVersion =
      await this.jobVersionService.findJobVersionByJobDefinitionIdAndVersion(
        job.name,
        job.jobVersion,
      );

    if (jobVersion) {
      this.logger.log(
        `System job ${job.name}, with version ${job.jobVersion} already exists, nothing to reschedule`,
      );
      return;
    }

    // for system jobs, the name, id and queue name are the same
    await this.jobDefinitionService.createOrUpdateEntity({
      id: job.name,
      jobName: job.name,
      queueName: job.name,
    });

    const queue = this.moduleRef.get<Queue>(
      getQueueToken(job.name),
      // To retrieve a provider from the global context pass the { strict: false } option as a second argument to get().
      { strict: false },
    );

    const repeatableJobsForQueue = await this.getRepeatableJobs(queue);

    this.validateSystemJobs(repeatableJobsForQueue);

    const scheduleJob: RepeatableJob | undefined = repeatableJobsForQueue[0];

    await this.checkAndRescheduleJobs(scheduleJob, job, jobVersion, queue);
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
    systemJobConfig: SystemJobConfig,
    job: BaseJobVersion | null,
    queue: Queue,
  ) {
    const patternChanged = scheduleJob?.pattern !== systemJobConfig.cron;
    const jobDataChanged = !job || !equal(job.jobData, systemJobConfig.jobData);

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

      await this.rescheduleSystemJob(systemJobConfig, queue);
    } else {
      this.logger.log(
        `System job ${systemJobConfig.name} is already scheduled and not changed`,
      );
    }
  }

  @Transactional()
  private async rescheduleSystemJob(
    systemJobConfig: SystemJobConfig,
    queue: Queue,
  ) {
    const scheduledJob = await queue.add(
      systemJobConfig.name,
      {
        ...systemJobConfig.jobData,
        jobVersion: systemJobConfig.jobVersion,
      },
      {
        jobId: systemJobConfig.name,
        repeat: {
          pattern: systemJobConfig.cron,
        },
      },
    );

    const jobVersion = await this.jobVersionService.createOrUpdateEntity({
      jobVersion: systemJobConfig.jobVersion,
      jobOptions: scheduledJob.opts,
      jobDefinitionId: systemJobConfig.name,
      jobData: {
        ...systemJobConfig.jobData,
        jobVersion: systemJobConfig.jobVersion,
      },
    });

    this.logger.log(
      `System job ${systemJobConfig.name} is scheduled with id ${scheduledJob.id}, and saved to db: ${jobVersion.id}`,
    );
  }
}
