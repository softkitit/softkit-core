import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { VersionedJobData } from './vo/job-data.dto';

export abstract class JobProcessor<
  JobDataType extends VersionedJobData,
> extends WorkerHost {
  protected logger: Logger;
  protected GET_JOBS_BATCH_SIZE = 100;

  constructor(protected queue: Queue<JobDataType>) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  protected abstract run(
    job: Job<JobDataType>,
    token?: string,
  ): Promise<unknown>;

  protected minimalSupportedVersion(): number {
    return 0;
  }

  override async process(
    job: Job<JobDataType>,
    token?: string,
  ): Promise<unknown> {
    this.logger.log(`Starting a job: ${job.name}:${job.id}`);

    try {
      return await this.run(job, token);
    } catch (error) {
      this.logger.error(
        `Exception happened while executing job: ${job.name}:${
          job.id
        }. Error: ${JSON.stringify(error)}`,
        error,
      );
      throw error;
    }
  }

  protected getJobId(job: Job<JobDataType>) {
    const jobId = job.opts.repeat?.jobId ?? job.opts.jobId;

    if (!jobId) {
      throw new UnrecoverableError(
        `Job id must be present in each job, but it's not here for job: ${job.name}`,
      );
    }

    return jobId;
  }

  protected async hasOtherActiveJobsById(
    job: Job<JobDataType>,
  ): Promise<boolean> {
    const currentJobId = this.getJobId(job);

    for (let i = 0; ; i++) {
      const activeJobs = await this.retrieveActiveJobs(
        i,
        this.GET_JOBS_BATCH_SIZE,
      );

      for (const activeJob of activeJobs) {
        const jobOptions = activeJob.opts;
        if (
          jobOptions.repeat?.jobId === currentJobId ||
          jobOptions.jobId === currentJobId
        ) {
          return true;
        }
      }

      if (activeJobs.length < this.GET_JOBS_BATCH_SIZE) {
        return false;
      }
    }
  }

  protected async lockJob(): Promise<boolean> {
    // todo implement
    return true;
  }

  protected retrieveActiveJobs(
    pageNumber: number,
    GET_JOBS_BATCH_SIZE: number = 100,
  ) {
    return this.queue.getJobs(
      ['active'],
      pageNumber * GET_JOBS_BATCH_SIZE,
      GET_JOBS_BATCH_SIZE,
      true,
    );
  }
}
