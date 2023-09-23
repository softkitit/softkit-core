import { StartedRedis, startRedis } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { UserRedisRepository } from './app/repository/user.redis.repository';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './app/repository/vo/user.entity';
import { StringRedisRepository } from './app/repository/string.redis.repository';

describe('redis in app tests', () => {
  let redis: StartedRedis;
  let userRedisRepository: UserRedisRepository;
  let stringRedisRepository: StringRedisRepository;

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
});
