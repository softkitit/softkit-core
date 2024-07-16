import { ValidateNestedProperty } from '@softkit/validation';
import { RedisConfig } from '../../../lib/config';
import { RedisLockConfig } from '../../../lib/config/redis-lock.config';

export class RedisRootConfig {
  @ValidateNestedProperty({ classType: RedisConfig })
  redisConfig!: RedisConfig;

  @ValidateNestedProperty({ classType: RedisLockConfig })
  redisLockConfig!: RedisLockConfig;
}
