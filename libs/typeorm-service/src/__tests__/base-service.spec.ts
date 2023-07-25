import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  InjectDataSource,
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import {
  Column,
  DataSource,
  DataSourceOptions,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { expectNotNullAndGet, startDb } from "@saas-buildkit/test-utils";
import { BaseEntityService } from "@saas-buildkit/typeorm-service";
import { BaseEntityHelper, BaseRepository } from "@saas-buildkit/typeorm";
import { ObjectNotFoundException } from "@saas-buildkit/exceptions";

describe('base service tests', () => {
  let testBaseService: TestBaseService;

  beforeAll(async () => {
    const { typeormOptions } = await startDb();

    @Injectable()
    class TypeOrmConfigService implements TypeOrmOptionsFactory {
      createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
          ...typeormOptions,
          entities: [TestBaseEntity],
        } as TypeOrmModuleOptions;
      }
    }

    initializeTransactionalContext();

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

            addTransactionalDataSource(dataSource);
            return await dataSource.initialize();
          },
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],

      providers: [TestBaseRepository, TestBaseService],
    }).compile();

    testBaseService = module.get(TestBaseService);
  });

  test('create one test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    checkAllTestFieldsPresent(objectToSave, savedEntity);
  });

  test('create one and update test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      firstName: 'updated first name',
    };

    const updatedEntity = await testBaseService.createOrUpdateEntity(
      dataToUpdate,
    );

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe(dataToUpdate.firstName);
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);
  });

  test('archive test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    expectNotNullAndGet(await testBaseService.findOneById(savedEntity.id));

    const archived = await testBaseService.archive(
      savedEntity.id,
      savedEntity.version,
    );

    expect(archived).toBeTruthy();

    await expect(
      testBaseService.findOneById(savedEntity.id),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('restore test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    expectNotNullAndGet(await testBaseService.findOneById(savedEntity.id));

    const archived = await testBaseService.archive(
      savedEntity.id,
      savedEntity.version,
    );

    expect(archived).toBeTruthy();

    await expect(
      testBaseService.findOneById(savedEntity.id),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);

    const restored = await testBaseService.unarchive(
      savedEntity.id,
      savedEntity.version + 1,
    );

    expect(restored).toBeTruthy();

    expect(await testBaseService.findOneById(savedEntity.id)).toBeDefined();
  });

  test('create one and use find test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    const savedEntityFound = expectNotNullAndGet(
      await testBaseService.findOneById(savedEntity.id),
    );

    expect(savedEntityFound.id).toBe(savedEntity.id);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      firstName: 'updated first name',
    };

    const updatedEntity = await testBaseService.createOrUpdateEntity(
      dataToUpdate,
    );

    const updatedEntityFound = expectNotNullAndGet(
      await testBaseService.findOneById(savedEntity.id),
    );

    expect(updatedEntity.firstName).toBe(updatedEntityFound.firstName);
  });

  test('find one throw exception test', async () => {
    await expect(
      testBaseService.findOneById(faker.string.uuid(), true),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('custom find one throw exception test', async () => {
    await expect(
      testBaseService.findOneByFirstName(faker.person.firstName()),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('custom find one return undefined test', async () => {
    expect(
      await testBaseService.findOneByFirstNameWithoutException(
        faker.person.firstName(),
      ),
    ).toBeUndefined();
  });

  test('custom find one return success test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    await expect(
      testBaseService.findOneByFirstName(savedEntity.firstName),
    ).toBeDefined();
  });

  it.each([
    [20, 5, 4],
    [10, 3, 4],
    [10, 1000, 1],
  ])(
    'find all paginated test',
    async (
      numberOfItems: number,
      pageSize: number,
      expectedNumberOfIterations: number,
    ) => {
      const uniqueId = faker.string.uuid();

      const firstName = `static first name ${uniqueId}`;

      const dataToSave = [...Array.from({ length: numberOfItems }).keys()].map(
        (a) => {
          return {
            password: a + uniqueId,
            firstName,
            lastName: faker.person.lastName(),
            nullableStringField: faker.person.jobTitle(),
          };
        },
      );

      await testBaseService.createOrUpdateEntities(dataToSave);

      const allEntities = [];

      let numberOfIterations: number;

      for (let i = 0; ; i++) {
        const entities = await testBaseService.findAll(
          {
            firstName,
          },
          i,
          pageSize,
        );

        allEntities.push(...entities.data);
        expect(entities.count).toBe(numberOfItems);

        if (!entities.hasNextPage) {
          numberOfIterations = i + 1;
          break;
        }
      }

      expect(numberOfIterations).toBe(expectedNumberOfIterations);

      const allPasswords = new Set(allEntities.map(({ password }) => password));

      for (let i = 0; i < numberOfItems; i++) {
        expect(allPasswords.has(i + uniqueId)).toBe(true);
      }
    },
  );

  test('success delete', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await testBaseService.createOrUpdateEntity(
      objectToSave,
    );

    const foundEntity = await testBaseService.findOneById(savedEntity.id);

    expect(foundEntity).toBeDefined();

    const deleted = await testBaseService.delete(savedEntity.id);

    expect(deleted).toBeTruthy();

    const foundEntitySecondTime = await testBaseService.findOneById(
      savedEntity.id,
      false,
    );

    expect(foundEntitySecondTime).toBeUndefined();

    const deletedSecondTime = await testBaseService.delete(savedEntity.id);

    expect(deletedSecondTime).toBeFalsy();
  });
});

function checkAllTestFieldsPresent(
  dtoForSaving: { firstName: string; lastName: string; password: string },
  saved?: TestBaseEntity,
) {
  if (!saved) {
    return;
  }

  expect(saved.id).toBeDefined();
  expect(saved.password).toBe(dtoForSaving.password);
  expect(saved.firstName).toBe(dtoForSaving.firstName);
  expect(saved.lastName).toBe(dtoForSaving.lastName);
  expect(saved.createdAt).toBeDefined();
  expect(saved.updatedAt).toBeDefined();
  expect(saved.deletedAt).toBeNull();
  expect(saved.nullableStringField).toBeNull();
}

@Entity()
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

@Injectable()
class TestBaseService extends BaseEntityService<
  TestBaseEntity,
  TestBaseRepository
> {
  constructor(r: TestBaseRepository) {
    super(r);
  }

  findOneByFirstName(firstName: string): Promise<TestBaseEntity | undefined> {
    return this.findOne({
      where: {
        firstName,
      },
    });
  }

  findOneByFirstNameWithoutException(
    firstName: string,
  ): Promise<TestBaseEntity | undefined> {
    return this.findOne(
      {
        where: {
          firstName,
        },
      },
      false,
    );
  }
}
