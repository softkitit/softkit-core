import { IsNumberLocalized } from '@softkit/validation';

/**
 * Base job data is a common data that must be present in each job for scheduling, one time or repeatable
 * */
export class BaseJobData {
  /**
   * version is used to define what to do with a job, in case if outdated version scheduled
   * the job itself can decide what to do with it,
   * for example, it can be just skip if the new job code is no longer can work with old data
   * It's a good practice to increment version each time when job data is changed
   * */
  @IsNumberLocalized()
  private version!: number;
}
