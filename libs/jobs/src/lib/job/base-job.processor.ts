import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue, UnrecoverableError } from 'bullmq';
import { VersionedJobData } from './vo/job-data.dto';
import { PinoLogger } from 'nestjs-pino';
import { OnApplicationBootstrap } from '@nestjs/common';

export abstract class BaseJobProcessor<JobDataType extends VersionedJobData>
  extends WorkerHost
  implements OnApplicationBootstrap
{
  protected GET_JOBS_BATCH_SIZE = 100;
  protected minimalSupportedVersion: number = 0;
  protected singleRunningJobGlobally = false;

  public onApplicationBootstrap() {
    this.worker.on('error', (error: Error) => {
      this.logger.error(
        {
          jobStatus: 'error',
        },
        `Queue: ${this.queue.name} worker error: ${error.message}, %s`,
        error.stack,
      );
    });

    this.worker.on(
      'failed',
      (job: Job<JobDataType> | undefined, error: Error, prev: string) => {
        this.logger.error(
          {
            previousStatus: prev,
            jobStatus: 'failed',
          },
          `Queue: ${this.queue.name} job: ${job?.name} failed with error: ${error.message}. Previous status: ${prev}. %s`,
          error.stack,
        );
      },
    );

    this.worker.on(
      'stalled',
      /* istanbul ignore next */ (jobId, prev) => {
        this.logger.error(
          {
            jobId,
            previousStatus: prev,
            jobStatus: 'stalled',
          },
          `Queue: ${this.queue.name} job: ${jobId} moved to stalled. In general it's ok, but if that happens often, it better to research it. Previous status: ${prev}`,
        );
      },
    );

    this.worker.on(
      'resumed',
      /* istanbul ignore next */ () => {
        this.logger.info(
          {
            jobStatus: 'resumed',
          },
          `Queue: ${this.queue.name} worker resumed`,
        );
      },
    );

    this.worker.on('closing', (msg) => {
      this.logger.info(
        {
          jobStatus: 'closing',
        },
        `Queue: ${this.queue.name} worker closing with message: ${msg}`,
      );
    });

    this.worker.on(
      'paused',
      /* istanbul ignore next */ () => {
        this.logger.info(
          {
            jobStatus: 'paused',
          },
          `Queue: ${this.queue.name} worker paused`,
        );
      },
    );

    this.worker.on('drained', () => {
      this.logger.info(
        {
          jobStatus: 'drained',
        },
        `Queue: ${this.queue.name} worker drained`,
      );
    });
  }

  constructor(
    protected queue: Queue<JobDataType>,
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  protected assignLoggerContextVariables(
    job: Job<JobDataType>,
    token: string | undefined,
  ) {
    this.logger.assign({
      jobId: job.opts.repeat?.jobId ?? job.opts.jobId,
      jobName: job.name,
      queueName: this.queue.name,
      jobVersion: job.data.jobVersion,
      token,
    });
  }

  protected verifyJobVersionMatch(job: Job<JobDataType>) {
    if (job.data.jobVersion < this.minimalSupportedVersion) {
      const message = `The job version for job is not supported by worker: ${job.id} is not supported, minimal version: ${this.minimalSupportedVersion}, current version: ${job.data.jobVersion}`;
      this.logger.error(message);
      throw new UnrecoverableError(message);
    }
  }

  protected getJobId(job: Job<JobDataType>) {
    const jobId = job.opts.repeat?.jobId ?? job.opts.jobId;

    /* istanbul ignore next */
    if (!jobId) {
      // todo add test, that may happen when job scheduled without a custom id, that shouldn't be used in jobs at all
      throw new UnrecoverableError(
        `Job id must be present in each job, but it's not here for job: ${job.name}`,
      );
    }

    return jobId;
  }

  /**
   * This function acquiring a lock for a finding current running jobs to avoid race conditions
   * */
  protected async hasJobRunning(job: Job<JobDataType>): Promise<boolean> {
    const jobId = this.getJobId(job);
    try {
      const locked = await this.acquireLock(jobId);
      if (!locked) {
        const msg = `Failed to acquire lock for job: ${job.name}, that's uncommon, but not critical, because the job will be retried`;
        this.logger.warn(msg);
        throw new Error(msg);
      }
      return await this.hasOtherActiveJobsById(job);
    } finally {
      await this.releaseLock(jobId);
    }
  }

  protected async hasOtherActiveJobsById(
    job: Job<JobDataType>,
  ): Promise<boolean> {
    const currentJobId = this.getJobId(job);

    let activeJobsCount = 0;

    for (let i = 0; ; i++) {
      const activeJobs = await this.retrieveActiveJobs(i);

      for (const activeJob of activeJobs) {
        const jobOptions = activeJob.opts;
        if (
          jobOptions.repeat?.jobId === currentJobId ||
          jobOptions.jobId === currentJobId
        ) {
          activeJobsCount += activeJobsCount + 1;

          if (activeJobsCount > 1) {
            this.logger.info(
              `Job: ${job.name}:${currentJobId} has other active job, skipping it, because the worker configured to run only one job by this type at a time`,
            );
            return true;
          }
        }
      }

      if (activeJobs.length < this.GET_JOBS_BATCH_SIZE) {
        return false;
      }
    }
  }

  protected async acquireLock(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _jobId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lockFor: number = 30_000,
  ): Promise<boolean> {
    // todo implement
    return true;
  }
  protected async releaseLock(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _jobId: string,
  ): Promise<boolean> {
    // todo implement
    return true;
  }

  protected retrieveActiveJobs(pageNumber: number) {
    return this.queue.getJobs(
      ['active'],
      pageNumber * this.GET_JOBS_BATCH_SIZE,
      this.GET_JOBS_BATCH_SIZE,
      true,
    );
  }
}
