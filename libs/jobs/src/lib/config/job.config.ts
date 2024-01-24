import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { JobOptions } from './job-options';

export class JobConfig {
  @IsString()
  name!: string;

  @Type(/* istanbul ignore next */ () => JobOptions)
  @ValidateNested()
  @IsOptional()
  @IsObject()
  options?: JobOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
  @IsObject()
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();
}
