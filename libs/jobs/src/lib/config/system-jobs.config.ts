import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntegerType } from '@softkit/validation';
import { SystemJobConfig } from './system-job.config';

export class SystemJobsConfig {
  @IntegerType
  @IsInt()
  systemJobLockTimeoutMillis: number = 15_000;

  @IsArray()
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Type(() => SystemJobConfig)
  jobs?: SystemJobConfig[];
}
