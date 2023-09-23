import { GenericContainer } from 'testcontainers';
import { DEFAULT_START_REDIS_OPTIONS, StartRedisOptions } from './vo';
import { RedisStartedConfig } from './vo';
import { setRedisTestEnv } from './env/set-redis-test-env';
import { StartedRedis } from './vo/redis/started-redis';

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
    .start();

  // eslint-disable-next-line no-console
  console.timeEnd(`start redis`);

  const redisConfig = {
    port: container.getMappedPort(6379),
    host: 'localhost',
  } satisfies RedisStartedConfig;

  await setRedisTestEnv(redisConfig);

  return {
    container,
    redisConfig,
  } satisfies StartedRedis;
}
