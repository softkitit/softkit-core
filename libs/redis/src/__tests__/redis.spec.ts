import { StartedRedis, startRedis } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { UserRedisRepository } from './app/repository/user.redis.repository';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './app/repository/vo/user.entity';
import { StringRedisRepository } from './app/repository/string.redis.repository';
import { RedlockService } from '@anchan828/nest-redlock';
import { wait } from 'nx-cloud/lib/utilities/waiter';

describe('redis in app tests', () => {
  let redis: StartedRedis;
  let userRedisRepository: UserRedisRepository;
  let stringRedisRepository: StringRedisRepository;
  let lockService: RedlockService;

  beforeAll(async () => {
    redis = await startRedis();
  }, 60_000);

  afterAll(async () => {
    if (redis) await redis.container.stop();
  });

  beforeEach(async () => {
    const { RedisTestAppModule } = require('./app/app.module');
    const testingModule = await Test.createTestingModule({
      imports: [RedisTestAppModule],
    }).compile();

    userRedisRepository = testingModule.get(UserRedisRepository);
    stringRedisRepository = testingModule.get(StringRedisRepository);
    lockService = testingModule.get(RedlockService);
  });

  it('should perform simple redis set and get on objects', async () => {
    const userEntity = plainToInstance(UserEntity, {
      id: 1,
      name: 'test',
      age: 1,
      active: true,
      createdAt: new Date(),
    });

    await userRedisRepository.saveUser(userEntity);

    const userFromDb = await userRedisRepository.getUser(userEntity.id);

    expect(userFromDb).toStrictEqual(userEntity);
  });

  it('should perform simple redis set and get just for strings', async () => {
    await stringRedisRepository.saveString('id', 'value');

    const value = await stringRedisRepository.getString('id');

    expect(value).toBe('value');
  });

  it('should do the lock properly', async () => {
    const lock1 = lockService.using(['test'], 1000, async () => {
      await wait(2000);
      return 1;
    });

    const lock2 = lockService.using(['test'], 1000, async () => {
      await wait(1000);
      return 2;
    });

    const [lock1Result, lock2Result] = await Promise.allSettled([lock1, lock2]);

    expect(lock1Result.status).toBe('fulfilled');
    expect(lock2Result.status).toBe('rejected');

    if (lock1Result.status === 'fulfilled') {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(lock1Result.value).toBe(1);
    }

    if (lock1Result.status === 'rejected') {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(lock1Result.reason?.message).toContain(
        'The operation was unable to achieve a quorum during its retry window.',
      );
    }
  });
});
