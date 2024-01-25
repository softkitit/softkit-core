import { Module } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RedisRootConfig } from './config/redis-root.config';
import { setupRedisModule } from '../../lib/redis.module';
import { UserRedisRepository } from './repository/user.redis.repository';
import { StringRedisRepository } from './repository/string.redis.repository';
import { setupRedisLockModule } from '../../lib/redis-lock.module';

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RedisRootConfig),
    setupRedisModule(),
    setupRedisLockModule(),
  ],
  providers: [UserRedisRepository, StringRedisRepository],
})
export class RedisTestAppModule {}
