import { SystemJobConfig } from '../../config';
import { VersionedJobData } from '../../job';
import { JobsOptions } from 'bullmq';

export abstract class AbstractSchedulingJobService {
  public abstract scheduleSystemJob(
    systemJobConfig: SystemJobConfig,
  ): Promise<void>;

  public abstract runRepeatableJobNow(
    queueName: string,
    jobId: string,
    customData?: object,
  ): Promise<void>;

  public abstract scheduleJob<T extends VersionedJobData>(
    queueName: string,
    jobName: string,
    jobId: string,
    data: T,
    jobOptions?: JobsOptions,
  ): Promise<void>;
}
