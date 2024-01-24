import { RedisConfig } from '../../../lib/config';
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RedisLockConfig } from '../../../lib/config/redis-lock.config';

export class RedisRootConfig {
  @ValidateNested()
  @Type(() => RedisConfig)
  @IsObject()
  redisConfig!: RedisConfig;

  @ValidateNested()
  @Type(() => RedisLockConfig)
  @IsObject()
  redisLockConfig!: RedisLockConfig;
}
