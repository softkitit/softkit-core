import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  expectNotNullAndGet,
  StartedDb,
  startPostgres,
} from '@softkit/test-utils';
import { UserEntity } from './app/user.entity';
import { UserRepository } from './app/user-repository.service';
import { setupTypeormModule } from '../lib/setup-typeorm-module';
import { In } from 'typeorm';

describe('start db and populate the entity', () => {
  let testUserRepository: UserRepository;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [UserEntity],
        migrations: ['app/migrations/*.ts'],
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
      providers: [UserRepository],
    }).compile();

    testUserRepository = module.get(UserRepository);
  });

  test('insert and find test', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    const saved = await testUserRepository.upsert(toSave);

    checkAllTestFieldsPresent(toSave, saved);

    const resultFromFindOne = await testUserRepository.findOne({
      firstName: toSave.firstName,
    });

    expect(resultFromFindOne).toBeDefined();
    expect(resultFromFindOne?.id).toBe(saved.id);
    checkAllTestFieldsPresent(toSave, resultFromFindOne);

    const findOneById = await testUserRepository.findById(saved.id);

    checkAllTestFieldsPresent(toSave, findOneById);
  });

  test('parallel updates', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    const saved = await testUserRepository.upsert(toSave);

    const updates = [...'1'.repeat(10)].map(() => {
      return testUserRepository.updateByQuery(
        {
          firstName: faker.person.firstName() + faker.number.int(),
        },
        {
          id: saved.id,
        },
      );
    });

    await Promise.all(updates);

    const saves = [...'1'.repeat(10)].map(() => {
      return testUserRepository.upsert({
        ...saved,
        firstName: faker.person.firstName() + faker.number.int(),
      });
    });

    await Promise.all(saves);
  });

  test('save with partial save check returned value', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    const saved = await testUserRepository.upsert(toSave);

    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.password).toBeDefined();
    expect(saved.firstName).toBeDefined();
    expect(saved.lastName).toBeDefined();
    expect(saved.nullableStringField).toBeNull();
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
    expect(saved.deletedAt).toBeNull();
    expect(saved.version).toBeDefined();

    const updateLastNameField = await testUserRepository.updatePartial({
      id: saved.id,
      version: saved.version,
      lastName: faker.person.lastName() + faker.number.int(),
    });

    expect(updateLastNameField.id).toBeDefined();
    expect(updateLastNameField.lastName).toBeDefined();
    expect(updateLastNameField.updatedAt).toBeDefined();
    expect(updateLastNameField.version).toBeDefined();

    expect(updateLastNameField.password).toBeNull();
    expect(updateLastNameField.firstName).toBeUndefined();
    expect(updateLastNameField.deletedAt).toBeNull();
    expect(updateLastNameField.createdAt).toBeUndefined();
  });

  test('save with partial save and return', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    const saved = await testUserRepository.upsert(toSave);

    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.password).toBeDefined();
    expect(saved.firstName).toBeDefined();
    expect(saved.lastName).toBeDefined();
    expect(saved.nullableStringField).toBeNull();
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
    expect(saved.deletedAt).toBeNull();
    expect(saved.version).toBeDefined();

    const updateLastNameField = await testUserRepository.updatePartial({
      id: saved.id,
      version: saved.version,
      lastName: faker.person.lastName() + faker.number.int(),
    });

    expect(updateLastNameField).toBeDefined();
    expect(updateLastNameField.id).toBeDefined();
    expect(updateLastNameField.password).toBeDefined();
    expect(updateLastNameField.firstName).toBeUndefined();
    expect(updateLastNameField.lastName).toBeDefined();
    expect(updateLastNameField.nullableStringField).toBeNull();
    expect(updateLastNameField.createdAt).toBeUndefined();
    expect(updateLastNameField.updatedAt).toBeDefined();
    expect(updateLastNameField.deletedAt).toBeNull();
    expect(updateLastNameField.version).toBeDefined();
  });

  test(`entity name should properly populate`, async () => {
    expect(testUserRepository.entityName()).toBe('UserEntity');
  });

  test('save and override null value', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await testUserRepository.upsert(toSave);

    expect(saved.nullableStringField).toBe(toSave.nullableStringField);

    const secondToSave = {
      id: saved.id,
      firstName: toSave.firstName,
      lastName: toSave.lastName,
      // eslint-disable-next-line unicorn/no-null
      nullableStringField: null,
      version: saved.version,
    };

    const savedSecondTime = await testUserRepository.upsert(secondToSave);

    expect(savedSecondTime.nullableStringField).toBeNull();

    const findSecondTime = await testUserRepository.findById(
      savedSecondTime.id,
    );

    expect(findSecondTime?.nullableStringField).toBeNull();
  });

  test('count by test', async () => {
    const firstName = 'First Name';

    const dataToSave = [...Array.from({ length: 5 }).keys()].map((a) => {
      return {
        password: faker.hacker.ingverb() + a,
        firstName,
        lastName: faker.person.lastName(),
        nullableStringField: faker.person.jobTitle(),
      };
    });

    const saved = await testUserRepository.upsert(dataToSave);

    const count = await testUserRepository.count({
      firstName,
    });

    expect(count).toBe(saved.length);
  });

  test('find all by ids test', async () => {
    const dataToSave = [...Array.from({ length: 5 }).keys()].map((a) => {
      return {
        password: faker.hacker.ingverb() + a,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        nullableStringField: faker.person.jobTitle(),
      };
    });

    const savedEntities = await testUserRepository.upsert(dataToSave);

    const allIds = savedEntities.map(({ id }) => id);

    const resultOfFind = await testUserRepository.findById(allIds);

    for (const saved of savedEntities) {
      const foundEntity = expectNotNullAndGet(
        resultOfFind.find((v) => saved.id === v?.id),
      );

      expect(saved.id).toBe(foundEntity.id);
      expect(saved.firstName).toBe(foundEntity.firstName);
    }
  });

  test('archive entity', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await testUserRepository.upsert(toSave);

    const foundEntity = expectNotNullAndGet(
      await testUserRepository.findById(saved.id),
    );

    const archived = await testUserRepository.archive(saved.id);

    expect(archived).toBeTruthy();

    const foundArchived = await testUserRepository.findById(saved.id);

    expect(foundArchived).toBeUndefined();

    const notFoundArchiveForTheFirstTime = await testUserRepository.findById(
      saved.id,
    );

    expect(notFoundArchiveForTheFirstTime).toBeUndefined();

    const allArchivedById = await testUserRepository.findAllWithArchived({
      id: saved.id,
    });
    const foundArchivedAfterFirstArchive = expectNotNullAndGet(
      // eslint-disable-next-line @typescript-eslint/await-thenable
      allArchivedById[0],
    );

    expect(foundArchivedAfterFirstArchive.version).toBe(
      foundEntity.version + 1,
    );

    expect(foundArchivedAfterFirstArchive.deletedAt).toBeDefined();

    const archivedSecondTime = await testUserRepository.archive(saved.id);

    expect(archivedSecondTime).toBeFalsy();

    const foundArchivedAfterSecondArchive = await testUserRepository.findById(
      saved.id,
    );

    expect(foundArchivedAfterSecondArchive).toBeUndefined();
  });

  test('archive multiple', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await Promise.all(
      Array.from({ length: 10 }).map((_) => testUserRepository.upsert(toSave)),
    );

    for (const userEntity of saved) {
      expectNotNullAndGet(await testUserRepository.findById(userEntity.id));
    }

    const allSavedIds = saved.map(({ id }) => id);

    const archived = await testUserRepository.archive(allSavedIds);

    expect(archived).toBeTruthy();

    const foundArchived = await testUserRepository.findById(allSavedIds);

    expect(foundArchived.length).toBe(0);

    const allArchived = await testUserRepository.findAllWithArchived({
      id: In(allSavedIds),
    });

    expect(allArchived.length).toBe(10);

    for (const userEntity of allArchived) {
      expect(userEntity.deletedAt).toBeDefined();
    }

    const archivedSecondTime = await testUserRepository.archive(allSavedIds);

    expect(archivedSecondTime).toBeFalsy();

    const restored = await testUserRepository.restore(allSavedIds);

    expect(restored).toBeTruthy();

    const allWithArchived = await testUserRepository.findAllWithArchived({
      id: In(allSavedIds),
    });

    expect(allWithArchived.length).toBe(10);

    const foundAsPlain = await testUserRepository.findAll({
      id: In(allSavedIds),
    });

    expect(foundAsPlain.length).toBe(10);

    for (const userEntity of foundAsPlain) {
      expect(userEntity.deletedAt).toBeNull();
    }
  });

  test('delete by id entity test', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await testUserRepository.upsert(toSave);

    expectNotNullAndGet(await testUserRepository.findById(saved.id));

    const deleted = await testUserRepository.delete(saved.id);

    expect(deleted).toBeTruthy();

    const foundDeleted = await testUserRepository.findById(saved.id);

    expect(foundDeleted).toBeUndefined();

    const notFoundArchiveForTheFirstTime = await testUserRepository.findById(
      saved.id,
    );

    expect(notFoundArchiveForTheFirstTime).toBeUndefined();

    const deletedSecondTime = await testUserRepository.delete(saved.id);

    expect(deletedSecondTime).toBe(false);
  });

  test('should delete multiple by ids', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await Promise.all(
      Array.from({ length: 10 }).map((_) => testUserRepository.upsert(toSave)),
    );

    for (const e of saved) {
      expectNotNullAndGet(await testUserRepository.findById(e.id));
    }

    const allIds = saved.map(({ id }) => id);
    const deleted = await testUserRepository.delete(allIds);

    expect(deleted).toBeTruthy();

    const foundDeleted = await testUserRepository.findById(allIds);

    expect(foundDeleted.length).toBe(0);

    const deletedSecondTime = await testUserRepository.delete(allIds);

    expect(deletedSecondTime).toBe(false);
  });

  test('archive and restore entity test', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      nullableStringField: faker.person.jobTitle(),
    };

    const saved = await testUserRepository.upsert(toSave);

    const foundEntity = expectNotNullAndGet(
      await testUserRepository.findById(saved.id),
    );

    const archived = await testUserRepository.archive(saved.id);

    expect(archived).toBeTruthy();

    const foundArchived = await testUserRepository.findById(saved.id);

    expect(foundArchived).toBeUndefined();

    const versionToRestore = foundEntity.version + 1;
    const restoreResults = await testUserRepository.restore(foundEntity.id);

    expect(restoreResults).toBeTruthy();

    const restoredEntity = expectNotNullAndGet(
      await testUserRepository.findById(saved.id),
    );

    expect(restoredEntity.version).toBe(versionToRestore + 1);
  });

  test('save and update', async () => {
    const toSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    const saved = await testUserRepository.upsert(toSave);

    const insertedRecord = await testUserRepository
      .findById(saved.id)
      .then(expectNotNullAndGet);

    checkAllTestFieldsPresent(toSave, insertedRecord);

    insertedRecord.lastName = toSave.lastName + '1';

    const entityToUpdate = {
      id: insertedRecord.id,
      version: insertedRecord.version,
      ...toSave,
    };

    const updated = await testUserRepository.update(entityToUpdate);

    const updatedRecord = await testUserRepository
      .findById(updated.id)
      .then(expectNotNullAndGet);

    expect(entityToUpdate.id).toBe(updatedRecord.id);
    checkAllTestFieldsPresent(entityToUpdate, updatedRecord);
    expect(insertedRecord.lastName).not.toBe(updatedRecord.lastName);

    const updatedSameRecordWithSameValuesAsInDb =
      await testUserRepository.update(entityToUpdate);

    const updatedRecordWithoutAnyChanges = await testUserRepository
      .findById(updatedSameRecordWithSameValuesAsInDb.id)
      .then(expectNotNullAndGet);

    // record shouldn't be updated because there are no changes in the entity
    expect(updatedRecordWithoutAnyChanges.updatedAt.getTime()).toBe(
      updatedRecord.updatedAt.getTime(),
    );

    checkAllTestFieldsPresent(entityToUpdate, updatedRecordWithoutAnyChanges);
  });
});

function checkAllTestFieldsPresent(
  dtoForSaving: { firstName: string; lastName: string; password: string },
  saved?: UserEntity | null,
) {
  expect(saved).toBeDefined();

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
