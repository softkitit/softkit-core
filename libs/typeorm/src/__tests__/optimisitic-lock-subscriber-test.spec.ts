import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { OptimisticLockingSubscriber } from '../lib/subscribers/optimistic-locking.subscriber';
import { startDb } from '@softkit/test-utils';
import { OptimisticLockException } from '@softkit/exceptions';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
import { UserEntity } from './app/user.entity';
import { UserRepository } from './app/user-repository.service';

describe('optimistic lost subscriber test', () => {
  let optimisticLockSubscriber: OptimisticLockingSubscriber;
  let testBaseRepository: UserRepository;

  beforeAll(async () => {
    const { typeormOptions } = await startDb();

    if (!getTransactionalContext()) {
      initializeTransactionalContext();
    }

    @Injectable()
    class TypeOrmConfigService implements TypeOrmOptionsFactory {
      createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
          ...typeormOptions,
          entities: [UserEntity],
          subscribers: [],
        } as TypeOrmModuleOptions;
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
          dataSourceFactory: async (options?: DataSourceOptions) => {
            if (!options) {
              throw new Error(
                `Can not initialize data source, options are empty`,
              );
            }

            const dataSource = new DataSource(options);

            const dsInitialized = getDataSourceByName('default');

            if (dsInitialized) {
              return dsInitialized;
            } else {
              addTransactionalDataSource(dataSource);
              return await dataSource.initialize();
            }
          },
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
    // same version
    [1],
    // eslint-disable-next-line unicorn/no-null
    [null],
    [undefined],
  ])(
    'optimistic lock exception different versions cases: %s',
    async (versionNumber?: number | null) => {
      const objectToSave = {
        password: faker.hacker.verb(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const beforeUpdateSpy = jest.spyOn(
        optimisticLockSubscriber,
        'beforeUpdate',
      );

      const testBaseEntitySave = await testBaseRepository.createOrUpdate(
        objectToSave,
      );
      expect(beforeUpdateSpy).toHaveBeenCalledTimes(0);

      const objectForUpdate = {
        ...objectToSave,
        firstName: objectToSave.firstName + '1',
        id: testBaseEntitySave.id,
        versionNumber,
      };
      await expect(
        testBaseRepository.createOrUpdate(objectForUpdate),
      ).rejects.toBeInstanceOf(OptimisticLockException);
    },
  );
});
