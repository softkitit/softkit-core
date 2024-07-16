import { JobsConfig } from '../../../config';
import { DbConfig } from '@softkit/typeorm';
import { LoggerConfig } from '@softkit/logger';
import { ValidateNestedProperty } from '@softkit/validation';

export class RootConfig {
  @ValidateNestedProperty({ classType: JobsConfig })
  jobsConfig!: JobsConfig;

  @ValidateNestedProperty({ classType: DbConfig })
  db!: DbConfig;

  @ValidateNestedProperty({ classType: LoggerConfig })
  logs!: LoggerConfig;
}
