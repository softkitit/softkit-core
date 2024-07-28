import { Job, Queue, UnrecoverableError } from 'bullmq';
import { JobStatus } from '../entity/vo';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../service';
import { VersionedJobData } from './vo/job-data.dto';
import { BaseJobExecution, BaseJobVersion } from '../entity';
import { PinoLogger } from 'nestjs-pino';
import { WithLoggerContext } from '@softkit/logger';
import { BaseJobProcessor } from './base-job.processor';
import { RedlockService } from '@anchan828/nest-redlock';

export abstract class JobProcessor<
  JobDataType extends VersionedJobData,
> extends BaseJobProcessor<JobDataType> {
  constructor(
    queue: Queue<JobDataType>,
    logger: PinoLogger,
    lockService: RedlockService,
    protected jobVersionService: AbstractJobVersionService,
    protected jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService);
  }

  protected abstract run(
    job: Job<JobDataType>,
    jobVersion: BaseJobVersion,
    token?: string,
  ): Promise<unknown>;

  @WithLoggerContext()
  override async process(
    job: Job<JobDataType>,
    token?: string,
  ): Promise<unknown> {
    const jobId = this.getJobId(job);

    this.assignLoggerContextVariables(job, token);

    this.logger.info(`Starting a job: ${job.name}:${jobId}`);

    const jobVersion =
      await this.jobVersionService.findJobVersionByJobDefinitionIdAndVersion(
        jobId,
        job.data.jobVersion,
      );

    if (!jobVersion) {
      const message = `Job: ${job.id}, with version: ${job.data.jobVersion}, wasn't saved to a persistent db, this is out of sync and require attention`;
      this.logger.error(message);
      throw new UnrecoverableError(message);
    }

    try {
      await this.trackJobStart(jobVersion, token);

      this.verifyJobVersionMatch(job);

      if (this.singleRunningJobGlobally) {
        const hasOtherJobRunning = await this.hasJobRunning(job);
        if (hasOtherJobRunning) {
          await this.trackJobSkipped(jobVersion, token);
          return;
        }
      }

      const result = await this.run(job, jobVersion, token);
      await this.trackJobCompleted(jobVersion, token, result);
      return result;
    } catch (error) {
      this.logger.error(
        {
          ...(error instanceof Error ? { err: error } : {}),
        },
        `Exception happened while executing job: ${job.name}:${job.id}`,
      );
      await this.trackJobFailed(jobVersion, error, token);
      throw error;
    }
  }

  protected baseTrackJobData(
    jobVersion: BaseJobVersion,
    token?: string,
  ): Partial<BaseJobExecution> {
    return {
      bullToken: token,
      jobVersionId: jobVersion.id,
    };
  }

  protected async trackJobStart(jobVersion: BaseJobVersion, token?: string) {
    await this.jobExecutionService.upsert({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.ACTIVE,
      progress: 1,
    } as BaseJobExecution);
  }

  protected async trackJobProgress(
    jobVersion: BaseJobVersion,
    progress: number,
    token?: string,
  ) {
    await this.jobExecutionService.upsert({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.PROCESSING,
      progress,
    } as BaseJobExecution);
  }

  protected async trackJobCompleted<T>(
    jobVersion: BaseJobVersion,
    token?: string,
    jobResult?: T,
  ) {
    await this.jobExecutionService.upsert({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.COMPLETED,
      progress: 100,
      stepData: jobResult,
    } as BaseJobExecution);
  }

  protected async trackJobFailed(
    jobVersion: BaseJobVersion,
    err: unknown,
    token?: string,
  ) {
    await this.jobExecutionService.upsert({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.FAILED,
      progress: 100,
      stepData: {
        ...(err instanceof Error
          ? { message: err.message, stacktrace: err.stack, name: err.name }
          : {}),
      },
    } as BaseJobExecution);
  }

  protected async trackJobSkipped(jobVersion: BaseJobVersion, token?: string) {
    await this.jobExecutionService.upsert({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.SKIPPED,
    } as BaseJobExecution);
  }
}
