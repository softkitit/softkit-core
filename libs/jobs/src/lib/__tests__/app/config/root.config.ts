import { JobsConfig } from '../../../config';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DbConfig } from '@softkit/typeorm';

export class RootConfig {
  @ValidateNested()
  @Type(() => JobsConfig)
  jobsConfig!: JobsConfig;

  @ValidateNested()
  @Type(() => DbConfig)
  db!: DbConfig;
}
