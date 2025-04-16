import { RedisStartedConfig } from './redis-config';
import { StartedTestContainer } from 'testcontainers/build/test-container';

export type StartedRedis = {
  container: StartedTestContainer;
  redisConfig: RedisStartedConfig;
};
