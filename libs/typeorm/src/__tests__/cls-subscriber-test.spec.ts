import { faker } from '@faker-js/faker';
import { ClsPresetSubscriber } from '../lib/subscribers/cls-preset.subscriber';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule, ClsService } from 'nestjs-cls';
import {
  expectNotNullAndGet,
  StartedDb,
  startPostgres,
} from '@softkit/test-utils';
import { TenantUserEntity } from './app/user-tenant.entity';
import { TenantUserRepository } from './app/user-tenant-repository.service';
import { TenantRepository } from './app/tenant.repository';
import { TenantEntity } from './app/tenant.entity';
import { UserAndTenantClsStore } from './app/cls/user.cls-store';

import { setupTypeormModule } from '../lib/setup-typeorm-module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

describe('tenant base service test', () => {
  const userId = 'doesnt matter';

  let tenantRepository: TenantRepository;
  let tenantUserRepository: TenantUserRepository;
  let clsService: ClsService<UserAndTenantClsStore>;
  let clsPresetSubscriber: ClsPresetSubscriber<UserAndTenantClsStore>;
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
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],
      providers: [TenantUserRepository, ClsPresetSubscriber, TenantRepository],
    }).compile();

    clsService = module.get(ClsService);
    tenantRepository = module.get(TenantRepository);
    clsPresetSubscriber = module.get(ClsPresetSubscriber);
    tenantUserRepository = module.get(TenantUserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('create one and update one test with auto tenant id population', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const tenant = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    await clsService.runWith(
      {
        tenantId: tenant.id,
        userId,
      },
      async () => {
        const beforeInsertSpy = jest.spyOn(clsPresetSubscriber, 'beforeInsert');
        const beforeUpdateSpy = jest.spyOn(clsPresetSubscriber, 'beforeUpdate');

        const saved =
          await tenantUserRepository.createOrUpdateWithReload(objectToSave);
        expect(beforeInsertSpy).toHaveBeenCalledTimes(1);

        expect(saved.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, saved);
        expect(saved.createdBy).toBe(userId);
        expect(saved.updatedBy).toBeNull();

        const found = expectNotNullAndGet(
          await tenantUserRepository.findOneBy({ id: saved.id }),
        );
        expect(saved.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, found);

        const objectToUpdate = {
          ...objectToSave,
          firstName: 'Vitalii',
          id: found?.id,
          version: found?.version,
        };
        const updatedEntity =
          await tenantUserRepository.createOrUpdateWithReload(objectToUpdate);

        expect(beforeUpdateSpy).toHaveBeenCalledTimes(1);

        const updatedEntityFound = expectNotNullAndGet(
          await tenantUserRepository.findOneBy({ id: saved.id }),
        );

        expect(updatedEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToUpdate, updatedEntityFound);
        expect(updatedEntityFound?.createdBy).toBe(userId);
        expect(updatedEntityFound?.updatedBy).toBe(userId);
      },
    );
  });

  test('create by one user than update as another user, and update again as 3rd user', async () => {
    const firstUserId = faker.string.uuid();
    const secondUserId = faker.string.uuid();
    const thirdUserId = faker.string.uuid();

    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const tenant = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    let entityId: string;

    await clsService.runWith(
      {
        tenantId: tenant.id,
        userId: firstUserId,
      },
      async () => {
        const saved = await tenantUserRepository.createOrUpdate(objectToSave);
        entityId = saved.id;

        expect(saved.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, saved);
        expect(saved.createdBy).toBe(firstUserId);
        expect(saved.updatedBy).toBeNull();
      },
    );

    for (const userForUpdate of [secondUserId, thirdUserId]) {
      await clsService.runWith(
        {
          tenantId: tenant.id,
          userId: userForUpdate,
        },
        async () => {
          const TenantUserEntity = await tenantUserRepository.createOrUpdate({
            ...objectToSave,
            firstName: faker.person.firstName(),
            id: entityId,
          } as TenantUserEntity);

          const updatedEntityFound = await tenantUserRepository.findOneBy({
            id: TenantUserEntity.id,
          });

          expect(updatedEntityFound?.id).toBe(entityId);
          expect(updatedEntityFound?.tenantId).toBe(tenant.id);
          expect(updatedEntityFound?.createdBy).toBe(firstUserId);
          expect(updatedEntityFound?.updatedBy).toBe(userForUpdate);
        },
      );
    }
  });

  test('create one and soft remove test', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const tenant = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    await clsService.runWith(
      {
        tenantId: tenant.id,
        userId,
      },
      async () => {
        const beforeInsertSpy = jest.spyOn(clsPresetSubscriber, 'beforeInsert');
        const beforeUpdateSpy = jest.spyOn(clsPresetSubscriber, 'beforeUpdate');

        const saved = await tenantUserRepository.createOrUpdate(objectToSave);
        expect(beforeInsertSpy).toHaveBeenCalledTimes(1);
        expect(beforeUpdateSpy).toHaveBeenCalledTimes(0);
        expect(saved.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, saved);

        const found = expectNotNullAndGet(
          await tenantUserRepository.findOneBy({
            id: saved.id,
          }),
        );

        expect(saved.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, found);

        await tenantUserRepository.archive(found.id, found.version);

        expect(beforeUpdateSpy).toHaveBeenCalledTimes(1);
      },
    );
  });

  test('create one and test find', async () => {
    const objectToSave = {
      password: faker.hacker.verb(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const tenant1 = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    const tenant2 = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    const savedEntityId = await clsService.runWith(
      {
        tenantId: tenant1.id,
        userId,
      },
      async () => {
        const saved = await tenantUserRepository.createOrUpdate(objectToSave);

        expectNotNullAndGet(
          await tenantUserRepository.findOneBy({
            id: saved.id,
          }),
        );

        return saved.id;
      },
    );

    await clsService.runWith(
      {
        tenantId: tenant2.id,
        userId,
      },
      async () => {
        await expect(
          tenantUserRepository.findOneBy({
            id: savedEntityId,
          }),
        ).resolves.toBeNull();
      },
    );
  });

  test('should fail on loading not base entity with cls-preset decorator', async () => {
    await expect(() => import('./app/not-an-entity.entity')).rejects.toThrow(
      TypeError,
    );
  });
});

function checkAllTestFieldsPresent(
  dtoForSaving: { firstName: string; lastName: string; password: string },
  saved?: TenantUserEntity | null,
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
  expect(saved.tenantId).toBeDefined();
  expect(saved.nullableStringField).toBeNull();
}
