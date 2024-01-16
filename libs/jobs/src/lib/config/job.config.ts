import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultJobOptionsConfig } from './default-job-options.config';

export class JobConfig {
  @IsString()
  name!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
  defaultJobOptions?: DefaultJobOptionsConfig;
}
