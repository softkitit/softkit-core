import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule, ClsService } from 'nestjs-cls';
import { In } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ClsPresetSubscriber } from '../lib/subscribers/cls-preset.subscriber';
import {
  expectNotNullAndGet,
  StartedDb,
  startPostgres,
} from '@softkit/test-utils';
import { TenantRepository } from './app/tenant.repository';
import { TenantEntity } from './app/tenant.entity';
import { TenantUserEntity } from './app/user-tenant.entity';
import { TenantUserRepository } from './app/user-tenant-repository.service';
import { FilterOperator } from 'nestjs-paginate';
import { USER_PAGINATED_CONFIG } from './app/user.entity';
import { setupTypeormModule } from '../lib/setup-typeorm-module';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { TenantClsStore } from '@softkit/persistence-api';

describe('tenant base entity test', () => {
  let userRepository: TenantUserRepository;
  let tenantRepository: TenantRepository;
  let clsService: ClsService<TenantClsStore>;
  let objectToSave: Pick<
    TenantUserEntity,
    'password' | 'firstName' | 'lastName' | 'createdBy'
  >;
  let createdTenant: TenantEntity;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [TenantUserEntity, TenantEntity],
        namingStrategy: new SnakeNamingStrategy(),
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TenantUserEntity, TenantEntity]),
        ClsModule.forRoot(),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
      ],
      providers: [TenantUserRepository, TenantRepository, ClsPresetSubscriber],
    }).compile();

    userRepository = module.get(TenantUserRepository);
    tenantRepository = module.get(TenantRepository);
    clsService = module.get(ClsService);
  });

  beforeEach(async () => {
    objectToSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
      createdBy: faker.string.uuid(),
    };

    createdTenant = await tenantRepository.upsert({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });
  });

  test('insert and find test', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const saved = await userRepository.upsert(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(await userRepository.findById(saved.id));
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const actual = await userRepository.findById(savedId);
        expect(actual).toBeUndefined();
      },
    );
  });

  test('insert 2 and find with or condition', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const savedFirst = await userRepository.upsert(objectToSave);
        const secondFirstName = faker.person.firstName() + faker.number.int();
        const savedSecond = await userRepository.upsert({
          ...objectToSave,
          firstName: secondFirstName,
        });
        const foundEntities = await userRepository.findAll([
          {
            firstName: objectToSave.firstName,
          },
          {
            firstName: secondFirstName,
          },
        ]);

        expect(foundEntities.length).toBe(2);
      },
    );
  });

  test('insert and update multiple records test', async () => {
    let savedEntityWithFirstTenant: TenantUserEntity;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const saved = await userRepository.upsert(objectToSave);

        savedEntityWithFirstTenant = saved;
        const updateResult = await userRepository.updatePartial({
          id: saved.id,
          version: saved.version,
          firstName: faker.person.firstName() + faker.number.int(),
        });

        expect(updateResult.version).toEqual(saved.version + 1);
      },
    );

    const secondTenant = await tenantRepository.upsert({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    await clsService.runWith(
      {
        tenantId: secondTenant.id,
      },
      async () => {
        const saved = await userRepository.upsert(objectToSave);

        // update multiple records
        const updateResult = await userRepository.updateByQuery(
          {
            firstName: faker.person.firstName() + faker.number.int(),
          },
          {
            id: In([saved.id, savedEntityWithFirstTenant.id]),
          },
        );
        // it should skip the update for the wrong tenant
        expect(updateResult).toEqual(1);
      },
    );
  });

  test('insert and find one test with or condition', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const saved = await userRepository.upsert(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(await userRepository.findById(savedId));
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const actual = await userRepository.findById(savedId);
        expect(actual).toBeUndefined();
      },
    );
  });

  test('delete record from the db', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const firstEntity = await userRepository.upsert(objectToSave);
        const secondEntity = await userRepository.upsert(objectToSave);

        savedId = secondEntity.id;

        const deleteResult = await userRepository.delete(firstEntity.id);

        expect(deleteResult).toBeTruthy();

        const foundEntity = await userRepository.findById(firstEntity.id);
        expect(foundEntity).toBeUndefined();

        // the record should not be found with deleted flag
        const foundEntityWithDeleted = await userRepository.findById(
          firstEntity.id,
        );

        expect(foundEntityWithDeleted).toBeUndefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const deleteResult = await userRepository.delete(savedId);
        expect(deleteResult).toBeFalsy();
      },
    );
  });

  test('find all by tenant test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);
        await userRepository.upsert(objectToSave);

        const allEntities = await userRepository.findAll();
        expect(allEntities.length).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const findAllForNotExistedTenant = await userRepository.findAll();
        expect(findAllForNotExistedTenant.length).toBe(0);

        const findWithDefaultOptions = await userRepository.findAll(
          {},
          {
            limit: 2,
            offset: 0,
          },
        );

        expect(findWithDefaultOptions.length).toBe(0);
      },
    );
  });

  test('findBy by tenant test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);
        await userRepository.upsert(objectToSave);

        const allEntities = await userRepository.findAll({
          firstName: objectToSave.firstName,
        });

        expect(allEntities.length).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const allEntities = await userRepository.findAll({
          firstName: objectToSave.firstName,
        });

        expect(allEntities.length).toBe(0);
      },
    );
  });

  test('findOneByOrFail by tenant test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);

        const entity = await userRepository.findOne({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        await expect(
          userRepository.findOne({
            firstName: objectToSave.firstName,
          }),
        ).resolves.toBeUndefined();
      },
    );
  });

  test('findOneBy by tenant', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);

        const entity = await userRepository.findOne({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const entity = await userRepository.findOne({
          firstName: objectToSave.firstName,
        });
        await expect(entity).toBeUndefined();
      },
    );
  });

  test('count by test with tenant', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);
        await userRepository.upsert(objectToSave);

        const allEntities = await userRepository.count();
        expect(allEntities).toBe(2);

        const allEntitiesCountWithOr = await userRepository.count({
          firstName: objectToSave.firstName,
        });

        expect(allEntitiesCountWithOr).toBe(2);

        const allEntitiesCountWithAnd = await userRepository.count({
          firstName: objectToSave.firstName,
        });

        expect(allEntitiesCountWithAnd).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const findAllForNotExistedTenant = await userRepository.count();
        expect(findAllForNotExistedTenant).toBe(0);
      },
    );
  });

  test('find one or fail test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);

        const successFullyFind = await userRepository.findOne({
          firstName: objectToSave.firstName,
        });
        expect(successFullyFind).not.toBeUndefined();

        await expect(
          userRepository.findOne({
            firstName: faker.person.firstName(),
          }),
        ).resolves.toBeUndefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        await expect(
          userRepository.findOne({
            firstName: objectToSave.firstName,
          }),
        ).resolves.toBeUndefined();
      },
    );
  });

  test('findAllPaginated test with pre-setting tenant id', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.upsert(objectToSave);

        const successFindByFirstName = await userRepository.findAllPaginated(
          {
            path: 'user',
            filter: {
              firstName: `${FilterOperator.EQ}:${objectToSave.firstName}`,
            },
          },
          USER_PAGINATED_CONFIG,
        );

        expect(successFindByFirstName.data.length).toBe(1);
        expect(successFindByFirstName.meta.totalItems).toBe(1);

        const successFullyFindByLastName =
          await userRepository.findAllPaginated(
            {
              filter: {
                lastName: `$or:${FilterOperator.EQ}:${objectToSave.lastName}`,
                firstName: `$or:${FilterOperator.EQ}:${objectToSave.firstName}`,
              },
              path: 'user',
            },
            USER_PAGINATED_CONFIG,
          );

        expect(successFullyFindByLastName.data.length).toBe(1);
        expect(successFullyFindByLastName.meta.totalItems).toBe(1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const successFullyFind = await userRepository.findAllPaginated(
          {
            filter: {
              firstName: `$or:${FilterOperator.EQ}:${objectToSave.firstName}`,
            },
            path: 'user',
          },
          USER_PAGINATED_CONFIG,
        );

        expect(successFullyFind.data.length).toBe(0);
        expect(successFullyFind.meta.totalItems).toBe(0);
      },
    );
  });

  it('should fail with no cls store', async () => {
    try {
      await userRepository.findOne({});
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(GeneralInternalServerException);
      return;
    }

    expect(true).toBe(false);
  });

  it('should fail with no tenant id but empty cls store', async () => {
    await clsService.runWith({}, async () => {
      try {
        await userRepository.findOne({});
      } catch (error) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error).toBeInstanceOf(GeneralInternalServerException);
        return;
      }

      expect(true).toBe(false);
    });
  });
});
