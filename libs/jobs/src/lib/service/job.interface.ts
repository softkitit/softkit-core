import { BaseJobEntity } from '../entity';
import { BaseJobData } from './vo';
import { BaseEntityHelper } from '@softkit/typeorm';

export interface IJobService<T extends BaseJobEntity<BaseJobData>> {
  getLatestJobVersionByName(name: string): Promise<T | null>;
  saveJob(
    job: Omit<T, keyof BaseEntityHelper> & {
      id?: never;
      version?: never;
    },
  ): Promise<T | null>;
}
