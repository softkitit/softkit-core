import { RedisModuleConfig } from '../../../lib/config';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RedisRootConfig {
  @ValidateNested()
  @Type(() => RedisModuleConfig)
  redisConfig!: RedisModuleConfig;
}
