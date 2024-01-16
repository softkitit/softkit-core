import { SystemJobConfig } from '../config/system-job.config';

export interface ISchedulingJobService {
  scheduleSystemJob(systemJobConfig: SystemJobConfig): Promise<void>;
}
