import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';
import { RedisConfig } from './config';
import { REDIS_CLIENTS } from '@songkeys/nestjs-redis/dist/redis/redis.constants';

export function setupRedisModule() {
  const dynamicModule = RedisModule.forRootAsync(
    {
      useFactory: async (config: RedisConfig): Promise<RedisModuleOptions> => {
        return {
          ...config,
        } satisfies RedisModuleOptions;
      },
      inject: [RedisConfig],
    },
    true,
  );
  return {
    ...dynamicModule,
    exports: [...(dynamicModule.exports || []), REDIS_CLIENTS],
  };
}
