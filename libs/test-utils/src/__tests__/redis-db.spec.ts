import { startRedis } from '../lib/start-redis';
import Redis from 'ioredis';

describe('start redis and create configs', () => {
  it('check redis starting, available and stopping', async () => {
    const { redisConfig, container } = await startRedis();

    try {
      expect(redisConfig.port).toBeDefined();
      expect(redisConfig.host).toBeDefined();

      const redis = new Redis(redisConfig);

      await redis.set('test', 'test');
      const result = await redis.get('test');
      expect(result).toBe('test');

      expect(container).toBeDefined();
    } finally {
      const stoppedTestContainer = await container.stop();
      expect(stoppedTestContainer).toBeDefined();
    }
  }, 60_000);
});
