import { Entity, ManyToOne } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseJobExecution } from './base/base-job-execution.entity';
import { JobVersion } from './job-version.entity';

@Entity('job_execution')
export class JobExecution extends BaseJobExecution {
  @Expose()
  @ManyToOne(() => JobVersion, {
    eager: false,
    cascade: false,
  })
  jobVersion?: JobVersion;
}
