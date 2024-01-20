import { Entity, Index, ManyToOne } from 'typeorm';
import { BaseJobVersion } from './base/base-job-version.entity';
import { JobDefinition } from './job.entity';
import { Expose } from 'class-transformer';

@Entity('job_version')
@Index(['jobDefinitionId', 'jobVersion'], { unique: true })
export class JobVersion extends BaseJobVersion {
  @ManyToOne(() => JobDefinition, {
    eager: false,
    cascade: false,
  })
  @Expose()
  jobDefinition?: JobDefinition;
}
