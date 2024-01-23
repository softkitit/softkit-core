import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { JobOptions } from './job-options';

export class JobConfig {
  @IsString()
  name!: string;

  @Type(/* istanbul ignore next */ () => JobOptions)
  @ValidateNested()
  @IsOptional()
  options?: JobOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();
}
