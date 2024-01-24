import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BooleanType } from '@softkit/validation';
import { RedisConfig, RedisLockConfig } from '@softkit/redis';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { SystemJobsConfig } from './system-jobs.config';
import { JobConfig } from './job.config';

export class JobsConfig {
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
  @IsObject()
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

  @Type(() => RedisConfig)
  @ValidateNested()
  @IsObject()
  redisConfig!: RedisConfig;

  @Type(() => RedisLockConfig)
  @ValidateNested()
  @IsObject()
  redisLockConfig: RedisLockConfig = new RedisLockConfig();

  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Type(() => JobConfig)
  @IsArray()
  jobs?: JobConfig[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SystemJobsConfig)
  @IsObject()
  systemJobs?: SystemJobsConfig;
}
