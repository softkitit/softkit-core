import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BooleanType } from '@softkit/validation';
import { RedisClientConfig } from '@softkit/redis';
import { DefaultJobOptionsConfig } from './default-job-options.config';

export class JobsConfig {
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
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
  @IsOptional()
  prefix?: string;

  /**
   * Avoid version validation to be greater or equal than v5.0.0.
   * @defaultValue false
   */
  @BooleanType
  @IsBoolean()
  skipVersionCheck: boolean = false;

  @Type(() => RedisClientConfig)
  @ValidateNested()
  connection!: RedisClientConfig;
}
