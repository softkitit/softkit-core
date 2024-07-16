import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { BooleanType, ValidateNestedProperty } from '@softkit/validation';
import { RedisConfig, RedisLockConfig } from '@softkit/redis';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { SystemJobsConfig } from './system-jobs.config';
import { JobConfig } from './job.config';

export class JobsConfig {
  @ValidateNestedProperty({
    required: false,
    classType: DefaultJobOptionsConfig,
  })
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();

  /**
   * Denotes commands should retry indefinitely.
   */
  @BooleanType
  @IsBoolean()
  blockingConnection: boolean = true;

  /**
   * Prefix for all queue keys.
   */
  @IsString()
  prefix!: string;

  @IsString()
  @IsOptional()
  applicationStartupLock?: string;

  /**
   * Avoid version validation to be greater or equal than v5.0.0.
   * @defaultValue false
   */
  @BooleanType
  @IsBoolean()
  skipVersionCheck: boolean = false;

  @ValidateNestedProperty({ classType: RedisConfig })
  redisConfig!: RedisConfig;

  @ValidateNestedProperty({ required: false, classType: RedisLockConfig })
  redisLockConfig: RedisLockConfig = new RedisLockConfig();

  @ValidateNestedProperty({
    classType: JobConfig,
    required: false,
    validationOptions: { each: true },
  })
  @IsArray()
  jobs?: JobConfig[];

  @ValidateNestedProperty({ required: false, classType: SystemJobsConfig })
  systemJobs?: SystemJobsConfig;
}
