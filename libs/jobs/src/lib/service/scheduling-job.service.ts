import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JobsOptions, Queue } from 'bullmq';
import { Propagation, Transactional } from 'typeorm-transactional';
import { AbstractSchedulingJobService } from './abstract/abstract-scheduling-job.service';
import { AbstractJobDefinitionService } from './abstract/abstract-job-definition.service';
import { AbstractJobVersionService } from './abstract/abstract-job-version.service';
import { VersionedJobData } from '../job';
import { getQueueToken } from '@nestjs/bullmq';
import { SystemJobConfig } from '../config';

@Injectable()
export class SchedulingJobService implements AbstractSchedulingJobService {
  protected readonly logger = new Logger(SchedulingJobService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly jobDefinitionService: AbstractJobDefinitionService,
    private readonly jobVersionService: AbstractJobVersionService,
  ) {}

  public async runRepeatableJobNow(
    queueName: string,
    jobId: string,
    overrideData?: object,
  ): Promise<void> {
    this.logger.log(
      {
        queueName,
        jobId,
      },
      `Scheduling repeatable job to run now. ${queueName}:${jobId}`,
    );

    const job = await this.jobVersionService.findLatestJobVersion(jobId);

    const queue = this.getQueueByName(queueName);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repeat: _, repeatJobKey: __, ...options } = job.jobOptions || {};

    await queue.add(job.jobDefinitionId, overrideData ?? job.jobData, {
      ...options,
      removeOnFail: true,
      removeOnComplete: true,
    });
  }

  public scheduleSystemJob(systemJobConfig: SystemJobConfig): Promise<void> {
    // for system job, queue name is a job name as well as an id
    return this.scheduleJob(
      systemJobConfig.name,
      systemJobConfig.name,
      systemJobConfig.name,
      {
        ...systemJobConfig.jobData,
        jobVersion: systemJobConfig.jobVersion,
      },
      {
        jobId: systemJobConfig.name,
        ...systemJobConfig.defaultJobOptions,
        repeat: systemJobConfig.repeat,
      },
    );
  }

  @Transactional({
    propagation: Propagation.REQUIRES_NEW,
  })
  public async scheduleJob<T extends VersionedJobData>(
    queueName: string,
    jobName: string,
    jobId: string,
    data: T,
    jobOptions?: JobsOptions,
  ) {
    this.logger.log(`Scheduling job ${jobName}:${jobId}`);

    const jobVersion =
      await this.jobVersionService.findJobVersionByJobDefinitionIdAndVersion(
        jobId,
        data.jobVersion,
      );

    if (jobVersion?.jobOptions?.repeat) {
      this.logger.log(
        `Repeatable job ${jobId}, with version ${data.jobVersion} already exists, nothing to reschedule`,
      );
      return;
    }

    await this.jobDefinitionService.create({
      id: jobId,
      jobName,
      queueName,
    });

    const updatedJobOptions = {
      jobId,
      ...jobOptions,
    };

    if (!jobVersion) {
      await this.jobVersionService.upsert({
        jobVersion: data.jobVersion,
        jobOptions: updatedJobOptions,
        jobDefinitionId: jobId,
        jobData: {
          ...data,
        },
      });
    }

    const queue = this.getQueueByName(queueName);

    if (jobOptions?.repeat) {
      const jobVersion = await this.jobVersionService.findPreviousJobVersion(
        jobId,
        data.jobVersion,
      );

      if (jobVersion) {
        const jobRemoved = await queue.removeRepeatable(
          jobName,
          jobVersion.jobOptions?.repeat || {},
          jobId,
        );

        /* istanbul ignore next */
        if (!jobRemoved) {
          throw new Error(
            `Failed to remove repeatable job ${jobName}:${jobId}, there is a chance that you may have multiple scheduled jobs now. It require investigation.`,
          );
        }
      }
    }

    await this.rescheduleJob(jobId, queue, jobName, data, updatedJobOptions);
  }

  private getQueueByName(queueName: string) {
    return this.moduleRef.get<Queue>(
      getQueueToken(queueName),
      // To retrieve a provider from the global context pass the { strict: false } option as a second argument to get().
      { strict: false },
    );
  }

  private async rescheduleJob<T extends VersionedJobData>(
    jobId: string,
    queue: Queue<T>,
    jobName: string,
    data: T,
    jobOptions?: JobsOptions,
  ) {
    const scheduledJob = await queue.add(
      jobName,
      {
        ...data,
      },
      {
        ...jobOptions,
      },
    );

    this.logger.log(
      {
        jobName,
        jobId,
      },
      `Job ${jobName}:${jobId} is scheduled with id ${scheduledJob.id}`,
    );
  }
}
