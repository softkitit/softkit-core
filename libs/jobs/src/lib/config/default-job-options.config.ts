import { BackoffOptions } from 'bullmq/dist/esm/interfaces';
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
  constructor(ageInDays: number = 3, count: number = 10_000) {
    this.age = ageInDays * 60 * 60 * 24;
    this.count = count;
  }

  /**
   * Maximum age in seconds for job to be kept.
   */
  @IsInt()
  @IntegerType
  @Min(0)
  age: number = 60 * 60 * 24 * 3;

  /**
   * Maximum count of jobs to be kept.
   */
  @IsInt()
  @IntegerType
  @Min(0)
  count: number = 10_000;
}

export class DefaultJobOptionsConfig {
  /**
   * Backoff setting for automatic retries if the job fails
   */
  @Type(() => BackoffOptionsConfig)
  @ValidateNested()
  backoff: BackoffOptions = new BackoffOptionsConfig();

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
   * Default behavior is up to 3 days and 10k jobs
   */
  @ValidateNested()
  @Type(() => KeepJobsConfig)
  removeOnComplete: KeepJobsConfig = new KeepJobsConfig();

  /**
   * Default behavior is up to 14 days and 10k jobs
   */
  @ValidateNested()
  @Type(() => KeepJobsConfig)
  removeOnFail?: KeepJobsConfig = new KeepJobsConfig(14);

  /**
   * Maximum amount of log entries that will be preserved
   * Default 10
   */
  @IsInt()
  @IntegerType
  @Min(0)
  keepLogs: number = 10;

  /**
   * Limits the amount of stack trace lines that will be recorded in the stacktrace.
   * Default 10
   */
  @IsInt()
  @IntegerType
  @Min(0)
  stackTraceLimit: number = 10;

  /**
   * Limits the size in bytes of the job's data payload (as a JSON serialized string).
   */
  @IsOptional()
  @IsInt()
  @IntegerType
  sizeLimit?: number;
}
