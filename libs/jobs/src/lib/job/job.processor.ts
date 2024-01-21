import { Job, Queue } from 'bullmq';
import { VersionedJobData } from './vo/job-data.dto';
import { WithLoggerContext } from '@softkit/logger';
import { PinoLogger } from 'nestjs-pino';
import { OnApplicationBootstrap } from '@nestjs/common';
import { BaseJobProcessor } from './base-job.processor';

export abstract class JobProcessor<JobDataType extends VersionedJobData>
  extends BaseJobProcessor<JobDataType>
  implements OnApplicationBootstrap
{
  constructor(queue: Queue<JobDataType>, logger: PinoLogger) {
    super(queue, logger);
  }

  protected abstract run(
    job: Job<JobDataType>,
    token?: string,
  ): Promise<unknown>;

  @WithLoggerContext()
  override async process(
    job: Job<JobDataType>,
    token?: string,
  ): Promise<unknown> {
    this.assignLoggerContextVariables(job, token);

    this.logger.info(`Starting a job: ${job.name}:${job.id}`);

    if (this.singleRunningJobGlobally) {
      const hasOtherJobRunning = await this.hasJobRunning(job);
      if (hasOtherJobRunning) {
        return;
      }
    }

    try {
      return await this.run(job, token);
    } catch (error) {
      this.logger.error(
        {
          error,
        },
        `Exception happened while executing job: ${job.name}:${job.id}`,
      );
      throw error;
    }
  }
}
