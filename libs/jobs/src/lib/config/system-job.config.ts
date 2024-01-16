import { BaseJobData } from '../service/vo';
import { IsString, ValidateNested } from 'class-validator';
import { JobConfig } from './job.config';
import { Type } from 'class-transformer';

export class SystemJobConfig<T extends BaseJobData> extends JobConfig {
  @IsString()
  cron!: string;

  @ValidateNested()
  @Type(() => BaseJobData)
  jobData!: T;
}
