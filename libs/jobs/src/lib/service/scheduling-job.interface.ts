import { BaseJobData } from './vo';
import { SystemJobConfig } from '../config/system-job.config';

export interface ISchedulingJobService<T extends BaseJobData> {
  scheduleSystemJob(systemJobConfig: SystemJobConfig<T>): Promise<void>;
}
