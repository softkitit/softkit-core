import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import {
  expectNotNullAndGet,
  StartedDb,
  startPostgres,
} from '@softkit/test-utils';
import { ObjectNotFoundException } from '@softkit/exceptions';
import { PAGINATED_CONFIG, UserEntity } from './app/user.entity';
import { UserService } from './app/user.service';
import { UserRepository } from './app/user.repository';
import { UserDto } from './app/user.dto';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { setupTypeormModule } from '@softkit/typeorm';

describe('base service tests', () => {
  let testBaseService: UserService;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [UserEntity],
        namingStrategy: new SnakeNamingStrategy(),
      },
    });
  });

  afterAll(async () => {
    await db.container.stop();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([UserEntity]),
        setupTypeormModule(__dirname, db.TypeOrmConfigService),
        ClsModule.forRoot({
          global: true,
        }),
      ],

      providers: [UserRepository, UserService],
    }).compile();

    testBaseService = module.get(UserService);
  });

  test('create one test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

    checkAllTestFieldsPresent(objectToSave, savedEntity);
  });

  test('create one and update test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      firstName: 'updated first name',
    };

    const updatedEntity =
      await testBaseService.createOrUpdateEntity(dataToUpdate);

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe(dataToUpdate.firstName);
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);

    const allEntities = await testBaseService.findAll();

    expect(allEntities.length).toBeGreaterThan(1);
  });

  test('archive test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

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

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

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

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

    const savedEntityFound = expectNotNullAndGet(
      await testBaseService.findOneById(savedEntity.id),
    );

    expect(savedEntityFound.id).toBe(savedEntity.id);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      firstName: 'updated first name',
    };

    const updatedEntity =
      await testBaseService.createOrUpdateEntity(dataToUpdate);

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

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

    await expect(
      testBaseService.findOneByFirstName(savedEntity.firstName),
    ).toBeDefined();
  });

  it.each([
    [20, 5, 4],
    [10, 3, 4],
    [10, 1000, 1],
  ])(
    'find all paginated test: number of items - %s, page size - %s, expected number of iterations - %s',
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
            password: a + '_' + uniqueId,
            firstName,
            lastName: faker.person.lastName(),
            nullableStringField: faker.person.jobTitle(),
          };
        },
      );

      await testBaseService.createOrUpdateEntities(dataToSave);

      const allEntities = [];

      let numberOfIterations: number;

      for (let i = 1; ; i++) {
        const filterQuery = {
          filter: {
            firstName: firstName,
          },
          page: i,
          limit: pageSize,
          path: 'test',
        };
        const entities = await testBaseService.findAllPaginated(
          filterQuery,
          PAGINATED_CONFIG,
        );

        const entitiesTransformed =
          await testBaseService.findAllPaginatedAndTransform(
            filterQuery,
            PAGINATED_CONFIG,
            UserDto,
          );

        const entitiesManualTransformedData = {
          ...entities,
          data: entities.data.map((e) => {
            return {
              id: e.id,
              createdAt: e.createdAt,
            };
          }),
        };

        expect(entitiesTransformed).toEqual(entitiesManualTransformedData);

        allEntities.push(...entities.data);
        expect(entities.meta.totalItems).toBe(numberOfItems);

        if (allEntities.length === entities.meta.totalItems) {
          numberOfIterations = i;
          break;
        }
      }

      const allEntitiesFromDb = await testBaseService.findAll(1, 1000);

      const allIdsFromDb = allEntitiesFromDb
        .filter((e) => e.firstName === firstName)
        .map((e) => e.id)
        .sort();

      const allRetrievedEntities = allEntities.map((e) => e.id).sort();
      expect(allIdsFromDb).toEqual(allRetrievedEntities);

      expect(numberOfIterations).toBe(expectedNumberOfIterations);

      const allPasswords = new Set(allEntities.map(({ password }) => password));

      for (let i = 0; i < numberOfItems; i++) {
        expect(allPasswords).toContain(i + '_' + uniqueId);
      }
    },
  );

  test('success delete', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity =
      await testBaseService.createOrUpdateEntity(objectToSave);

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
  saved?: UserEntity,
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
