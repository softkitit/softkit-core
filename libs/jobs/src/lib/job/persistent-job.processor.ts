import { Job, Queue, UnrecoverableError } from 'bullmq';
import { JobStatus } from '../entity/vo';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../service';
import { VersionedJobData } from './vo/job-data.dto';
import { JobProcessor } from './job.processor';
import { BaseJobExecution, BaseJobVersion } from '../entity';
import { PinoLogger } from 'nestjs-pino';
import { WithLoggerContext } from '@softkit/logger';

export abstract class PersistentJobProcessor<
  JobDataType extends VersionedJobData,
> extends JobProcessor<JobDataType> {
  constructor(
    queue: Queue<JobDataType>,
    logger: PinoLogger,
    protected jobVersionService: AbstractJobVersionService,
    protected jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger);
  }

  protected abstract runWithTracking(
    job: Job<JobDataType>,
    jobVersion: BaseJobVersion,
    token?: string,
  ): Promise<unknown>;

  protected override run(): Promise<unknown> {
    throw new UnrecoverableError(
      `Persistent job doesn't support method run, use run with tracking, it populates the job version so tracking is based on it`,
    );
  }

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

      if (job.data.jobVersion >= this.minimalSupportedVersion) {
        const result = await this.runWithTracking(job, jobVersion, token);
        await this.trackJobCompleted(jobVersion, token, result);
        return result;
      } else {
        const message = `The job version for job is not supported by worker: ${job.id} is not supported, minimal version: ${this.minimalSupportedVersion}, current version: ${job.data.jobVersion}`;
        this.logger.error(message);
        throw new UnrecoverableError(message);
      }
    } catch (error) {
      this.logger.error(
        {
          error,
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
    await this.jobExecutionService.createOrUpdateEntity({
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
    await this.jobExecutionService.createOrUpdateEntity({
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
    await this.jobExecutionService.createOrUpdateEntity({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.COMPLETED,
      progress: 100,
      stepData: jobResult,
    } as BaseJobExecution);
  }

  protected async trackJobFailed(
    jobVersion: BaseJobVersion,
    err: Error | unknown,
    token?: string,
  ) {
    await this.jobExecutionService.createOrUpdateEntity({
      ...this.baseTrackJobData(jobVersion, token),
      jobStatus: JobStatus.FAILED,
      progress: 100,
      stepData: err,
    } as BaseJobExecution);
  }
}
