import { SystemJobConfig } from '../config/system-job.config';

export abstract class AbstractSchedulingJobService {
  public abstract scheduleSystemJob(
    systemJobConfig: SystemJobConfig,
  ): Promise<void>;
}
