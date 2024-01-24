import { RedlockModule } from '@anchan828/nest-redlock';
import { REDIS_CLIENTS } from '@songkeys/nestjs-redis/dist/redis/redis.constants';
import { RedisClients } from '@songkeys/nestjs-redis/dist/redis/interfaces';
import { RedisLockConfig } from './config/redis-lock.config';

export function setupRedisLockModule() {
  return RedlockModule.registerAsync({
    useFactory: (clients: RedisClients, config: RedisLockConfig) => {
      const redisClients = [...clients.values()];

      return {
        clients: redisClients,
        settings: {
          ...config,
        },
        duration: config.defaultDecoratorLockDuration,
      };
    },
    inject: [REDIS_CLIENTS, RedisLockConfig],
  });
}
