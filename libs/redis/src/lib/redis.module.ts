import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';
import { RedisModuleConfig } from './config';

export function setupRedisModule() {
  return RedisModule.forRootAsync({
    useFactory: async (
      config: RedisModuleConfig,
    ): Promise<RedisModuleOptions> => {
      return {
        ...config,
      } satisfies RedisModuleOptions;
    },
    inject: [RedisModuleConfig],
  });
}
