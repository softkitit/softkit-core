import { Entity, OneToMany } from 'typeorm';
import { BaseJobDefinitionEntity } from './base/base-job-definition.entity';
import { JobVersion } from './job-version.entity';

@Entity('job')
export class JobDefinition extends BaseJobDefinitionEntity {
  @OneToMany(() => JobVersion, (version) => version.jobDefinition, {
    eager: false,
    cascade: false,
  })
  jobDataVersions?: JobVersion[];
}
