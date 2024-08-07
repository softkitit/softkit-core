import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptimisticLockingSubscriber } from '../lib/subscribers/optimistic-locking.subscriber';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { OptimisticLockException } from '@softkit/exceptions';
import { UserEntity } from './app/user.entity';
import { UserRepository } from './app/user-repository.service';
import { setupTypeormModule } from '../lib/setup-typeorm-module';

describe('optimistic lost subscriber test', () => {
  let optimisticLockSubscriber: OptimisticLockingSubscriber;
  let testBaseRepository: UserRepository;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [UserEntity],
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([UserEntity]),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
      ],
      providers: [UserRepository, OptimisticLockingSubscriber],
    }).compile();

    testBaseRepository = module.get(UserRepository);
    optimisticLockSubscriber = module.get(OptimisticLockingSubscriber);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    // negative version
    [-1],
    // bigger version
    [1000],
    // version before
    [0],
  ])(
    'optimistic lock exception different versions cases: %s',
    async (versionNumber: number) => {
      const objectToSave = {
        password: faker.hacker.verb(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const beforeUpdateSpy = jest.spyOn(
        optimisticLockSubscriber,
        'beforeUpdate',
      );

      const testBaseEntitySave = await testBaseRepository.upsert(objectToSave);
      expect(beforeUpdateSpy).toHaveBeenCalledTimes(0);

      const objectForUpdate = {
        ...objectToSave,
        firstName: objectToSave.firstName + '1',
        id: testBaseEntitySave.id,
        version: versionNumber,
      };
      await expect(
        testBaseRepository.upsert(objectForUpdate),
      ).rejects.toBeInstanceOf(OptimisticLockException);

      expect(beforeUpdateSpy).toHaveBeenCalledTimes(1);
    },
  );
});
