import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  InjectDataSource,
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import {
  Column,
  DataSource,
  DataSourceOptions,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { BaseEntityHelper } from '../lib/entities/entity-helper';
import { BaseRepository } from '../lib/repositories/base.repository';
import { OptimisticLockingSubscriber } from '../lib/subscribers/optimistic-locking.subscriber';
import { startDb } from '@saas-buildkit/test-utils';
import { OptimisticLockException } from '@saas-buildkit/exceptions';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';

describe('optimistic lost subscriber test', () => {
  let optimisticLockSubscriber: OptimisticLockingSubscriber;
  let testBaseRepository: TestBaseRepository;

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
          entities: [TestBaseEntity],
          subscribers: [],
        } as TypeOrmModuleOptions;
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TestBaseEntity]),
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

      providers: [TestBaseRepository, OptimisticLockingSubscriber],
    }).compile();

    testBaseRepository = module.get(TestBaseRepository);
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
    'optimistic lock exception different versions cases',
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

  @Entity({})
  class TestBaseEntity extends BaseEntityHelper {
    @PrimaryGeneratedColumn('uuid')
    override id!: string;

    // having it nullable is useful for set password later logic
    @Column({ nullable: true, length: 256 })
    password?: string;

    @Column({ type: String, nullable: false, length: 128 })
    firstName!: string;

    @Column({ type: String, nullable: false, length: 128 })
    lastName!: string;

    @Column({ type: String, nullable: true, length: 128 })
    nullableStringField?: string | null;
  }

  @Injectable()
  class TestBaseRepository extends BaseRepository<TestBaseEntity> {
    constructor(
      @InjectDataSource()
      private ds: DataSource,
    ) {
      super(TestBaseEntity, ds);
    }
  }
});
