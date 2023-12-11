import { JobsConfig } from '../../../config/jobs.config';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class RootConfig {
  @ValidateNested()
  @Type(() => JobsConfig)
  jobsConfig!: JobsConfig;
}
