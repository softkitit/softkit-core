import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { BooleanType, IntegerType } from '@softkit/validation';

export class BackoffOptionsConfig {
  @IsEnum(['fixed', 'exponential'])
  type: 'fixed' | 'exponential' = 'fixed';

  /**
   * Delay in milliseconds.
   */
  @IsInt()
  @IntegerType
  delay: number = 15_000;
}

export class KeepJobsConfig {
  constructor(ageInDays: number = 0, count: number = 0) {
    this.age = ageInDays * 60 * 60 * 24;
    this.count = count;
  }

  /**
   * Maximum age in seconds for job to be kept.
   */
  @IsInt()
  @IntegerType
  @Min(0)
  @IsOptional()
  age?: number = 0;

  /**
   * Maximum count of jobs to be kept.
   */
  @IsInt()
  @IntegerType
  @Min(0)
  @IsOptional()
  count?: number = 0;
}

export class DefaultJobOptionsConfig {
  /**
   * Backoff setting for automatic retries if the job fails
   */
  @Type(() => BackoffOptionsConfig)
  @ValidateNested()
  backoff: BackoffOptionsConfig = new BackoffOptionsConfig();

  /**
   * If true, adds the job to the right of the queue instead of the left (default false)
   *
   * @see {@link https://docs.bullmq.io/guide/jobs/lifo}
   */
  @IsOptional()
  @BooleanType
  @IsBoolean()
  lifo?: boolean;

  /**
   * Default behavior is up to 0 days and 0 jobs
   * It allows us to do not have multiple jobs with the same type running in a cluster
   */
  @ValidateNested()
  @Type(() => KeepJobsConfig)
  removeOnComplete: KeepJobsConfig = new KeepJobsConfig();

  /**
   * Default behavior is 0 days and 0 jobs
   * We do store this information in postgres, so redis doesn't make too much sense
   */
  @ValidateNested()
  @Type(() => KeepJobsConfig)
  removeOnFail?: KeepJobsConfig = new KeepJobsConfig();

  /**
   * Maximum amount of log entries that will be preserved
   * Default 0, because we don't think that storing logs in redis is a good idea in general
   */
  @IsInt()
  @IntegerType
  @Min(0)
  keepLogs: number = 0;

  /**
   * Limits the amount of stack trace lines that will be recorded in the stacktrace.
   * Default 0, everything will be in logs if you need a stacktrace and should be for debugging,
   * doesn't sound like a good idea to store in redis
   */
  @IsInt()
  @IntegerType
  @Min(0)
  stackTraceLimit: number = 0;

  /**
   * Limits the size in bytes of the job's data payload (as a JSON serialized string).
   */
  @IsOptional()
  @IsInt()
  @IntegerType
  sizeLimit?: number;
}
