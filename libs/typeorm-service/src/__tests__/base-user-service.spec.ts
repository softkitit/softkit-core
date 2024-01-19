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
import { PAGINATED_CONFIG, UserEntity } from './app/entity/user.entity';
import { UserService } from './app/service/user.service';
import { UserRepository } from './app/repository/user.repository';
import { UserDto } from './app/vo/user.dto';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { setupTypeormModule } from '@softkit/typeorm';

describe('base user service tests', () => {
  let userService: UserService;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [UserEntity],
        namingStrategy: new SnakeNamingStrategy(),
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([UserEntity]),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],

      providers: [UserRepository, UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  test('create one test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    checkAllTestFieldsPresent(objectToSave, savedEntity);
  });

  test('create one and update test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      version: 0,
      firstName: 'updated first name',
    };

    const updatedEntity = await userService.createOrUpdateEntity(dataToUpdate);

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe(dataToUpdate.firstName);
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);

    const foundEntity = await userService.findAll();
    expect(foundEntity.length).toBeGreaterThanOrEqual(1);
  });

  test('should update successfully all fields', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    const updatedEntity = await userService.createOrUpdateEntity({
      id: savedEntity.id,
      firstName: 'updated',
      lastName: 'updated',
      password: 'updated',
      version: savedEntity.version,
    });

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe('updated');
    expect(updatedEntity.lastName).toBe('updated');
    expect(updatedEntity.password).toBe('updated');
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);
  });

  test('should partial update just name', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    const updatedEntity = await userService.partialUpdate({
      id: savedEntity.id,
      firstName: 'updated',
      version: 3,
    });

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe('updated');
    expect(updatedEntity.lastName).toBeUndefined();
    expect(updatedEntity.password).toBeNull();
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);
    expect(updatedEntity.version).toBe(2);
  });

  test('archive test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    expectNotNullAndGet(await userService.findOneById(savedEntity.id));

    const archived = await userService.archive(
      savedEntity.id,
      savedEntity.version,
    );

    expect(archived).toBeTruthy();

    await expect(
      userService.findOneById(savedEntity.id),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('restore test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    expectNotNullAndGet(await userService.findOneById(savedEntity.id));

    const archived = await userService.archive(
      savedEntity.id,
      savedEntity.version,
    );

    expect(archived).toBeTruthy();

    await expect(
      userService.findOneById(savedEntity.id),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);

    const restored = await userService.unarchive(
      savedEntity.id,
      savedEntity.version + 1,
    );

    expect(restored).toBeTruthy();

    expect(await userService.findOneById(savedEntity.id)).toBeDefined();
  });

  test('create one and use find test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    const savedEntityFound = expectNotNullAndGet(
      await userService.findOneById(savedEntity.id),
    );

    expect(savedEntityFound.id).toBe(savedEntity.id);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      version: savedEntity.version,
      firstName: 'updated first name',
    };

    const updatedEntity = await userService.createOrUpdateEntity(dataToUpdate);

    const updatedEntityFound = expectNotNullAndGet(
      await userService.findOneById(savedEntity.id),
    );

    expect(updatedEntity.firstName).toBe(updatedEntityFound.firstName);
  });

  test('find one throw exception test', async () => {
    await expect(
      userService.findOneById(faker.string.uuid(), true),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('custom find one throw exception test', async () => {
    await expect(
      userService.findOneByFirstName(faker.person.firstName()),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('custom find one return undefined test', async () => {
    expect(
      await userService.findOneByFirstNameWithoutException(
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

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    await expect(
      userService.findOneByFirstName(savedEntity.firstName),
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

      await userService.createOrUpdateEntities(dataToSave);

      const allEntities = [];

      let numberOfIterations: number;

      for (let i = 1; ; i++) {
        const filterQuery = {
          filter: {
            firstName,
          },
          page: i,
          limit: pageSize,
          path: 'test',
        };

        const entities = await userService.findAllPaginated(
          filterQuery,
          PAGINATED_CONFIG,
        );

        const entitiesTransformed =
          await userService.findAllPaginatedAndTransform(
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

      const allEntitiesFromDb = await userService.findAll(1, 1000);

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
    10_000_000,
  );

  test('success delete', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.createOrUpdateEntity(objectToSave);

    const foundEntity = await userService.findOneById(savedEntity.id);

    expect(foundEntity).toBeDefined();

    const deleted = await userService.delete(savedEntity.id);

    expect(deleted).toBeTruthy();

    const foundEntitySecondTime = await userService.findOneById(
      savedEntity.id,
      false,
    );

    expect(foundEntitySecondTime).toBeUndefined();

    const deletedSecondTime = await userService.delete(savedEntity.id);

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
