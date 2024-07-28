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
import { AuditEntity } from './app/entity/audit.entity';
import { UserService } from './app/service/user.service';
import { AuditService } from './app/service/audit.service';
import { UserRepository } from './app/repository/user.repository';
import { AuditRepository } from './app/repository/audit.repository';
import { CreateUserDTO, UserDto } from './app/vo/user.dto';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { setupTypeormModule } from '@softkit/typeorm';

describe('base user service tests', () => {
  let userService: UserService;
  let testAuditService: AuditService;
  let recordAudit: jest.SpyInstance;
  let recordGeneralAction: jest.SpyInstance;
  let actualSignUpProcess: jest.SpyInstance;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [UserEntity, AuditEntity],
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
        TypeOrmModule.forFeature([UserEntity, AuditEntity]),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],

      providers: [UserRepository, UserService, AuditRepository, AuditService],
    }).compile();

    userService = module.get<UserService>(UserService);
    testAuditService = module.get(AuditService);
    recordAudit = jest.spyOn(testAuditService, 'recordAudit');
    recordGeneralAction = jest.spyOn(testAuditService, 'recordGeneralAction');
    actualSignUpProcess = jest.spyOn(userService, 'actualSignUpProcess');
  });

  describe('Transactional Decorator Test', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it.skip('should execute all steps correctly on successful sign up', async () => {
      const testObject = {
        firstName: 'jh',
        lastName: 'ksr',
        password: 'abc',
      } satisfies CreateUserDTO;
      const savedEntity = await userService.signUp(testObject);
      checkAllTestFieldsPresent(testObject, savedEntity);

      const audits = await testAuditService.findAll();

      expect(recordGeneralAction).toHaveBeenNthCalledWith(
        1,
        'Signup Initiated',
        `attempted with first name: ${testObject.firstName}`,
      );

      expect(actualSignUpProcess).toHaveBeenCalledWith(testObject);

      expect(recordAudit).toHaveBeenCalledWith(
        savedEntity.id,
        'Sign up success',
        `first name: ${savedEntity.firstName}`,
      );

      expect(recordGeneralAction).toHaveBeenCalledWith(
        3,
        'Signup Finished',
        `finished signup for user: ${testObject.firstName}`,
      );
    });
  });

  it('should record a failed signup attempt', async () => {
    jest.spyOn(userService, 'actualSignUpProcess').mockImplementation(() => {
      throw new Error('Signup failed');
    });

    const testObject = {
      firstName: 'jh',
      lastName: 'ksr',
      password: 'abc',
    } satisfies CreateUserDTO;

    try {
      await userService.signUp(testObject);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(new Error('Signup failed'));
    }

    const audits = await testAuditService.findAll();

    expect(recordGeneralAction).toHaveBeenNthCalledWith(
      1,
      'Signup Initiated',
      `attempted with first name: ${testObject.firstName}`,
    );

    expect(recordGeneralAction).toHaveBeenNthCalledWith(
      2,
      'Signup Failed',
      `failed for user: ${testObject.firstName}`,
    );

    expect(recordGeneralAction).toHaveBeenNthCalledWith(
      3,
      'Signup Finished',
      `finished signup for user: ${testObject.firstName}`,
    );
  });

  test('create one test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.upsert(objectToSave);

    checkAllTestFieldsPresent(objectToSave, savedEntity);
  });

  test('create one and update test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.create(objectToSave);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      version: 0,
      firstName: 'updated first name',
    };

    const updatedEntity = await userService.update(dataToUpdate);

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe(dataToUpdate.firstName);
    expect(updatedEntity.updatedAt).toBeTruthy();
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

    const savedEntity = await userService.upsert(objectToSave);

    const updatedEntity = await userService.upsert({
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

    const savedEntity = await userService.upsert(objectToSave);

    const updatedEntity = await userService.partialUpdate({
      id: savedEntity.id,
      firstName: 'updated',
      version: 2,
    });

    expect(updatedEntity.id).toBe(savedEntity.id);
    expect(updatedEntity.firstName).toBe('updated');
    expect(updatedEntity.lastName).toBeUndefined();
    expect(updatedEntity.password).toBeNull();
    expect(savedEntity.updatedAt).not.toBe(updatedEntity.updatedAt);
    expect(updatedEntity.version).toBe(2);
  });

  test('should partial update many items name', async () => {
    const objectToSave = Array.from({ length: 10 }).map((_) => ({
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }));

    const savedEntity = await userService.upsert(objectToSave);

    const updatedFirstName = 'updated';

    const entitiesToUpdate = savedEntity.map((e) => ({
      id: e.id,
      version: e.version,
      firstName: updatedFirstName,
    }));

    const updatedEntities = await userService.partialUpdate(entitiesToUpdate);

    for (const updatedEntity of updatedEntities) {
      expect(updatedEntity.id).toBeDefined();
      expect(updatedEntity.firstName).toBe(updatedFirstName);
      expect(updatedEntity.lastName).toBeUndefined();
      expect(updatedEntity.password).toBeNull();
      expect(updatedEntity.updatedAt).toBeDefined();
      expect(updatedEntity.version).toBe(2);
    }

    const allUpdatedEntitiesIds = updatedEntities
      .map(({ id }) => id)
      .filter((v): v is string => v !== undefined);

    const allFound = await userService.findById(allUpdatedEntitiesIds);

    expect(allFound.length).toBe(allUpdatedEntitiesIds.length);

    for (const userEntity of allFound) {
      expect(userEntity.version).toBe(2);
    }
  });

  test('archive test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.upsert(objectToSave);

    expectNotNullAndGet(await userService.findById(savedEntity.id));

    const archived = await userService.archive(savedEntity.id);

    expect(archived).toBeTruthy();

    await expect(userService.findById(savedEntity.id)).rejects.toBeInstanceOf(
      ObjectNotFoundException,
    );
  });

  test('should archive and restore many', async () => {
    const itemsCount = 10;
    const toSave = Array.from({ length: itemsCount }).map((_) => ({
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }));

    const saved = await userService.upsert(toSave);

    const savedIds = saved.map(({ id }) => id);

    const foundSaved = await userService.findById(savedIds);

    expect(foundSaved.length).toBe(itemsCount);

    const archived = await userService.archive(savedIds);

    expect(archived).toBeTruthy();

    const foundAfterArchived = await userService.findById(savedIds);

    expect(foundAfterArchived.length).toBe(0);

    const restored = await userService.restore(savedIds);

    expect(restored).toBeTruthy();

    const foundAfterRestore = await userService.findById(savedIds);

    expect(foundAfterRestore.length).toBe(itemsCount);
  });

  test('restore test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.upsert(objectToSave);

    expectNotNullAndGet(await userService.findById(savedEntity.id));

    const archived = await userService.archive(savedEntity.id);

    expect(archived).toBeTruthy();

    await expect(userService.findById(savedEntity.id)).rejects.toBeInstanceOf(
      ObjectNotFoundException,
    );

    const restored = await userService.restore(savedEntity.id);

    expect(restored).toBeTruthy();

    expect(await userService.findById(savedEntity.id)).toBeDefined();
  });

  test('create one and use find test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.upsert(objectToSave);

    const savedEntityFound = expectNotNullAndGet(
      await userService.findById(savedEntity.id),
    );

    expect(savedEntityFound.id).toBe(savedEntity.id);

    const dataToUpdate = {
      ...objectToSave,
      id: savedEntity.id,
      version: savedEntity.version,
      firstName: 'updated first name',
    };

    const updatedEntity = await userService.create(dataToUpdate);

    const updatedEntityFound = expectNotNullAndGet(
      await userService.findById(savedEntity.id),
    );

    expect(updatedEntity.firstName).toBe(updatedEntityFound.firstName);
  });

  it.each([1, 2, 10])(
    'create %s entities and update each',
    async (itemsCount: number) => {
      const objectToSave = Array.from({ length: itemsCount }).map((_) => ({
        password: faker.hacker.verb(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      }));

      const savedEntity = await userService.create(objectToSave);

      const firstNameUpdated = 'updated first name';
      const dataToUpdate = savedEntity.map((e) => ({
        ...e,
        firstName: firstNameUpdated,
      }));

      const updatedEntity = await userService.update(dataToUpdate);

      for (const userEntity of updatedEntity) {
        expect(userEntity.firstName).toBe(firstNameUpdated);
      }
    },
  );

  test('find one throw exception test', async () => {
    await expect(
      userService.findById(faker.string.uuid(), true),
    ).rejects.toBeInstanceOf(ObjectNotFoundException);
  });

  test('custom find one throw exception test', async () => {
    await expect(
      userService.findOneByFirstName(faker.person.firstName()),
    ).resolves.toBeUndefined();
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

    const savedEntity = await userService.upsert(objectToSave);

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

      await userService.upsert(dataToSave);

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

        const entitiesTransformed = await userService.findAllPaginated(
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

      const allEntitiesFromDb = await userService.findAll(0, 1000);

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
    100_000,
  );

  test('should delete one successfully', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const savedEntity = await userService.upsert(objectToSave);

    const foundEntity = await userService.findById(savedEntity.id);

    expect(foundEntity).toBeDefined();

    const deleted = await userService.delete(savedEntity.id);

    expect(deleted).toBeTruthy();

    const foundEntitySecondTime = await userService.findById(
      savedEntity.id,
      false,
    );

    expect(foundEntitySecondTime).toBeUndefined();

    const deletedSecondTime = await userService.delete(savedEntity.id);

    expect(deletedSecondTime).toBeFalsy();
  });

  test('should delete many successfully', async () => {
    const toSave = Array.from({ length: 10 }).map((_) => ({
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }));

    const saved = await userService.upsert(toSave);

    const savedIds = saved.map(({ id }) => id);

    const foundAfterSave = await userService.findById(savedIds);

    expect(foundAfterSave).toBeDefined();
    expect(foundAfterSave.length).toBe(savedIds.length);

    const deleted = await userService.delete(savedIds);

    expect(deleted).toBeTruthy();

    const foundAfterDeletion = await userService.findById(savedIds);

    expect(foundAfterDeletion.length).toBe(0);

    const deletedSecondTime = await userService.delete(savedIds);

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
