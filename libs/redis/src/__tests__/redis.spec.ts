import { StartedRedis, startRedis } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { UserRedisRepository } from './app/repository/user.redis.repository';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './app/repository/vo/user.entity';
import { StringRedisRepository } from './app/repository/string.redis.repository';
import { RedlockService } from '@anchan828/nest-redlock';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { faker } from '@faker-js/faker';

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
    const lockId = faker.string.uuid();
    const lock1 = lockService.using([lockId], 1000, async () => {
      await wait(2000);
      return 1;
    });

    const lock2 = lockService.using([lockId], 1000, async () => {
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

  it('should release lock once finished, no matter time we pass', async () => {
    const lockId = faker.string.uuid();

    const lock1 = lockService.using([lockId], 40_000, async () => {
      await wait(300);
      return 1;
    });

    await wait(400);

    const lock2 = lockService.using([lockId], 234_234, async () => {
      await wait(500);
      return 2;
    });

    const [firstLock, secondLock] = await Promise.all([lock1, lock2]);

    expect(firstLock).toBe(1);
    expect(secondLock).toBe(2);
  });

  it('should lock various resources and finish all of them successfully', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }).map((_, index) => {
        return lockService.using([`resource-${index}`], 1100, async () => {
          await wait(1000);
          return index;
        });
      }),
    );

    expect(results).toStrictEqual(
      Array.from({ length: 10 }).map((_, index) => index),
    );
  });
});
