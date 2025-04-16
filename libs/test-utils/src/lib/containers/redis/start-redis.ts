import { GenericContainer, Wait } from 'testcontainers';
import { setRedisTestEnv } from './set-redis-test-env';
import { StartedRedis } from './started-redis';
import {
  DEFAULT_START_REDIS_OPTIONS,
  StartRedisOptions,
} from './start-redis-options';
import { retrievePortFromBinding } from '../utils';
import { RedisStartedConfig } from './redis-config';

export async function startRedis(
  opts?: Partial<StartRedisOptions>,
): Promise<StartedRedis> {
  // eslint-disable-next-line no-console
  console.time(`start redis`);
  const options = {
    ...DEFAULT_START_REDIS_OPTIONS,
    ...opts,
  };

  const container = await new GenericContainer(
    `${options.imageName}:${options.imageTag}`,
  )
    .withExposedPorts(6379)
    .withStartupTimeout(50_000)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start();

  // eslint-disable-next-line no-console
  console.timeEnd(`start redis`);

  const redisConfig = {
    port: retrievePortFromBinding(container, 6379),
    host: 'localhost',
  } satisfies RedisStartedConfig;

  await setRedisTestEnv(redisConfig);

  return {
    container,
    redisConfig,
  } satisfies StartedRedis;
}
