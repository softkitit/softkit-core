import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';
import { RedisConfig } from './config';

export function setupRedisModule() {
  return RedisModule.forRootAsync({
    useFactory: async (config: RedisConfig): Promise<RedisModuleOptions> => {
      return {
        ...config,
      } satisfies RedisModuleOptions;
    },
    inject: [RedisConfig],
  });
}
