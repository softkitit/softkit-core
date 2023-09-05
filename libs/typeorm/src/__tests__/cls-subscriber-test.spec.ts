import { faker } from '@faker-js/faker';
import { BaseEntityHelper } from '../lib/entities/entity-helper';
import { BaseTenantEntityHelper } from '../lib/entities/tenant-entity-helper';
import { ClsPresetSubscriber } from '../lib/subscribers/cls-preset.subscriber';
import { ClsPresetDecorator } from '../lib/subscribers/decorator/cls-preset.decorator';
import { PresetType } from '../lib/subscribers/decorator/vo/preset-type';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  InjectDataSource,
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { ClsModule, ClsService } from 'nestjs-cls';
import {
  Column,
  DataSource,
  DataSourceOptions,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
// todo fix import
import { TenantClsStore } from '../lib/vo/tenant-base-cls-store';
import { expectNotNullAndGet, startDb } from '@softkit/test-utils';
import { BaseTenantRepository } from '../lib/repositories/tenant-base.repository';
import { BaseRepository } from '../lib/repositories/base.repository';

describe('tenant base service test', () => {
  const userId = 'doesnt matter';

  let tenantRepository: TenantRepository;
  let testBaseRepository: TestBaseRepository;
  let clsService: ClsService<UserAndTenantClsStore>;
  let clsPresetSubscriber: ClsPresetSubscriber<UserAndTenantClsStore>;

  beforeAll(async () => {
    const { typeormOptions } = await startDb();

    @Injectable()
    class TypeOrmConfigService implements TypeOrmOptionsFactory {
      createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
          ...typeormOptions,
          entities: [TestBaseEntity, TenantEntity],
          subscribers: [],
          namingStrategy: new SnakeNamingStrategy(),
        } as TypeOrmModuleOptions;
      }
    }

    if (!getTransactionalContext()) {
      initializeTransactionalContext();
    }

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TestBaseEntity, TenantEntity]),
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
        ClsModule.forRoot({
          global: true,
        }),
      ],

      providers: [TestBaseRepository, ClsPresetSubscriber, TenantRepository],
    }).compile();

    clsService = module.get(ClsService);
    tenantRepository = module.get(TenantRepository);
    clsPresetSubscriber = module.get(ClsPresetSubscriber);
    testBaseRepository = module.get(TestBaseRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
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

        const testBaseEntity =
          await testBaseRepository.createOrUpdateWithReload(objectToSave);
        expect(beforeInsertSpy).toHaveBeenCalledTimes(1);

        expect(testBaseEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, testBaseEntity);
        expect(testBaseEntity.createdBy).toBe(userId);
        expect(testBaseEntity.updatedBy).toBeNull();

        const testBaseEntityFound = expectNotNullAndGet(
          await testBaseRepository.findOneBy({ id: testBaseEntity.id }),
        );
        expect(testBaseEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, testBaseEntityFound);

        const objectToUpdate = {
          ...objectToSave,
          firstName: 'Vitalii',
          id: testBaseEntityFound?.id,
          version: testBaseEntityFound?.version,
        };
        const updatedEntity = await testBaseRepository.createOrUpdateWithReload(
          objectToUpdate,
        );

        expect(beforeUpdateSpy).toHaveBeenCalledTimes(1);

        const updatedEntityFound = expectNotNullAndGet(
          await testBaseRepository.findOneBy({ id: testBaseEntity.id }),
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
        const testBaseEntity = await testBaseRepository.save(objectToSave);
        entityId = testBaseEntity.id;

        expect(testBaseEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, testBaseEntity);
        expect(testBaseEntity.createdBy).toBe(firstUserId);
        expect(testBaseEntity.updatedBy).toBeNull();
      },
    );

    for (const userForUpdate of [secondUserId, thirdUserId]) {
      await clsService.runWith(
        {
          tenantId: tenant.id,
          userId: userForUpdate,
        },
        async () => {
          const testBaseEntity = await testBaseRepository.save({
            ...objectToSave,
            firstName: faker.person.firstName(),
            id: entityId,
          } as TestBaseEntity);

          const updatedEntityFound = await testBaseRepository.findOneBy({
            id: testBaseEntity.id,
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
        beforeInsertSpy.mockReset();
        beforeUpdateSpy.mockReset();

        const testBaseEntity = await testBaseRepository.save(objectToSave);
        expect(beforeInsertSpy).toHaveBeenCalledTimes(1);
        expect(beforeUpdateSpy).toHaveBeenCalledTimes(0);
        expect(testBaseEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, testBaseEntity);

        const testBaseEntityFound = expectNotNullAndGet(
          await testBaseRepository.findOneBy({
            id: testBaseEntity.id,
          }),
        );

        expect(testBaseEntity.tenantId).toBe(tenant.id);
        checkAllTestFieldsPresent(objectToSave, testBaseEntityFound);

        await testBaseRepository.archive(
          testBaseEntityFound.id,
          testBaseEntityFound.version,
        );

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
        const testBaseEntity = await testBaseRepository.save(objectToSave);

        expectNotNullAndGet(
          await testBaseRepository.findOneBy({
            id: testBaseEntity.id,
          }),
        );

        return testBaseEntity.id;
      },
    );

    await clsService.runWith(
      {
        tenantId: tenant2.id,
        userId,
      },
      async () => {
        await expect(
          testBaseRepository.findOneBy({
            id: savedEntityId,
          }),
        ).resolves.toBeNull();
      },
    );
  });
});

function checkAllTestFieldsPresent(
  dtoForSaving: { firstName: string; lastName: string; password: string },
  saved?: TestBaseEntity | null,
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

@Entity({})
class TestBaseEntity extends BaseTenantEntityHelper {
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

  @ManyToOne(() => TenantEntity, {
    eager: false,
  })
  @JoinColumn()
  tenant?: TenantEntity | null;

  @ClsPresetDecorator<UserAndTenantClsStore>({
    clsPropertyFieldName: 'userId',
    presetType: PresetType.INSERT,
  })
  @Column({ type: String, nullable: false, length: 128 })
  createdBy!: string;

  @ClsPresetDecorator<UserAndTenantClsStore>({
    clsPropertyFieldName: 'userId',
    presetType: PresetType.UPDATE,
  })
  @Column({ type: String, nullable: true, length: 128 })
  updatedBy!: string;
}

@Entity()
class TenantEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  override id!: string;

  @Column({ type: String, unique: true, nullable: true })
  @Index()
  tenantUrl!: string;

  @Column({ type: String, nullable: false, length: 1024 })
  tenantName!: string;
}

@Injectable()
class TestBaseRepository extends BaseTenantRepository<TestBaseEntity> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    clsService: ClsService<UserAndTenantClsStore>,
  ) {
    super(TestBaseEntity, dataSource, clsService);
  }
}

@Injectable()
class TenantRepository extends BaseRepository<TenantEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(TenantEntity, ds);
  }
}

interface UserAndTenantClsStore extends TenantClsStore {
  userId: string;
}
