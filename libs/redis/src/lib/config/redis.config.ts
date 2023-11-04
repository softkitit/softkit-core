import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BooleanType } from '@softkit/validation';
import { Type } from 'class-transformer';
import { RedisClientConfig } from './redis-client.config';
import { RedisCommonConfig } from './redis-common.config';

export class RedisConfig {
  @IsBoolean()
  @BooleanType
  readyLog = true;

  @IsBoolean()
  @BooleanType
  errorLog = true;

  /**
   * It's a common config that will be applied to each client
   * */
  @IsOptional()
  @Type(() => RedisCommonConfig)
  @ValidateNested()
  commonConfig?: RedisCommonConfig;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => RedisClientConfig)
  @ValidateNested({ each: true })
  config!: RedisClientConfig[];
}
