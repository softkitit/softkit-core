import { Entity, Index } from 'typeorm';
import { BaseJobData } from '../service/vo';
import { BaseJobEntity } from './base-job.entity';

@Index(['name', 'jobVersion'], { unique: true })
@Entity('jobs')
export class Job<
  JOB_DATA extends BaseJobData = BaseJobData,
> extends BaseJobEntity<JOB_DATA> {}
