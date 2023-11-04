import { RedisConfig } from '../../../lib/config';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RedisRootConfig {
  @ValidateNested()
  @Type(() => RedisConfig)
  redisConfig!: RedisConfig;
}
