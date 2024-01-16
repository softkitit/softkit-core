import { Entity, Index } from 'typeorm';
import { BaseJobEntity } from './base-job.entity';

@Index(['name', 'jobVersion'], { unique: true })
@Entity('jobs')
export class Job extends BaseJobEntity {}
