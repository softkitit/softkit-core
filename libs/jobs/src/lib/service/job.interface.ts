import { BaseJobEntity } from '../entity';
import { BaseEntityHelper } from '@softkit/typeorm';

export interface IJobService<T extends BaseJobEntity> {
  getLatestJobVersionByName(name: string): Promise<T | null>;
  saveJob(
    job: Omit<T, keyof BaseEntityHelper> & {
      id?: never;
      version?: never;
    },
  ): Promise<T | null>;
}
