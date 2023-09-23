import { RedisStartedConfig } from '../vo/redis/redis-config';

export async function setRedisTestEnv(config: RedisStartedConfig) {
  process.env['TEST_REDIS_PORT'] = config.port + '';
  process.env['TEST_REDIS_HOST'] = config.host;
}
