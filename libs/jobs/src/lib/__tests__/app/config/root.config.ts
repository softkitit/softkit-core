import { JobsConfig } from '../../../config';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DbConfig } from '@softkit/typeorm';
import { LoggerConfig } from '@softkit/logger';

export class RootConfig {
  @ValidateNested()
  @Type(() => JobsConfig)
  jobsConfig!: JobsConfig;

  @ValidateNested()
  @Type(() => DbConfig)
  db!: DbConfig;

  @ValidateNested()
  @Type(() => LoggerConfig)
  logs!: LoggerConfig;
}
