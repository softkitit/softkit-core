import { faker } from '@faker-js/faker';
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
  EntityNotFoundError,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { BaseEntityHelper, BaseTenantEntityHelper, ClsPresetSubscriber, TenantClsStore } from "@saas-buildkit/typeorm";
import { expectNotNullAndGet, startDb } from "@saas-buildkit/test-utils";
import BaseRepository from "../lib/repositories/base.repository";
import BaseTenantRepository from "../lib/repositories/tenant-base.repository";

describe('tenant base entity test', () => {
  let testBaseRepository: TestBaseRepository;
  let tenantRepository: TenantRepository;
  let clsService: ClsService<TenantClsStore>;
  let objectToSave: Partial<TestBaseEntity>;
  let createdTenant: TenantEntity;

  beforeAll(async () => {
    const { typeormOptions } = await startDb();

    @Injectable()
    class TypeOrmConfigService implements TypeOrmOptionsFactory {
      createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
          ...typeormOptions,
          subscribers: [],
          entities: [TestBaseEntity, TenantEntity],
          namingStrategy: new SnakeNamingStrategy(),
        } as TypeOrmModuleOptions;
      }
    }

    initializeTransactionalContext();

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TestBaseEntity, TenantEntity]),
        ClsModule.forRoot(),
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
      ],
      providers: [TestBaseRepository, TenantRepository, ClsPresetSubscriber],
    }).compile();

    testBaseRepository = module.get(TestBaseRepository);
    tenantRepository = module.get(TenantRepository);
    clsService = module.get(ClsService);
  });

  beforeEach(async () => {
    objectToSave = {
      password: faker.hacker.ingverb(),
      firstName: faker.person.firstName() + faker.number.int(),
      lastName: faker.person.lastName(),
    };

    createdTenant = await tenantRepository.createOrUpdate({
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
        const saved = await testBaseRepository.createOrUpdate(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(await testBaseRepository.findSingle(saved.id));
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const actual = await testBaseRepository.findSingle(savedId);
        expect(actual).toBeNull();
      },
    );
  });

  test('insert and update multiple records test', async () => {
    let savedEntityWithFirstTenant: TestBaseEntity;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        const saved = await testBaseRepository.createOrUpdate(objectToSave);
        savedEntityWithFirstTenant = saved;
        const updateResult = await testBaseRepository.update(saved.id, {
          firstName: faker.person.firstName() + faker.number.int(),
        });

        expect(updateResult.affected).toEqual(1);
      },
    );

    const secondTenant = await tenantRepository.createOrUpdate({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    await clsService.runWith(
      {
        tenantId: secondTenant.id,

      },
      async () => {
        const saved = await testBaseRepository.createOrUpdate(objectToSave);

        // update multiple records
        const updateResult = await testBaseRepository.update(
          [saved.id, savedEntityWithFirstTenant.id],
          {
            firstName: faker.person.firstName() + faker.number.int(),
          },
        );
        // it should skip the update for the wrong tenant
        expect(updateResult.affected).toEqual(1);
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
        const saved = await testBaseRepository.createOrUpdate(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(
          await testBaseRepository.findOne({
            where: [{ id: saved.id }, { id: saved.id }],
          }),
        );
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const actual = await testBaseRepository.findOne({
          where: [{ id: savedId }, { id: savedId }],
        });
        expect(actual).toBeNull();
      },
    );
  });

  test('decrement test', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        const sampleNumber = 10;

        const saved = await testBaseRepository.createOrUpdate({
          ...objectToSave,
          sampleNumber,
        });

        const actual = await testBaseRepository.decrement(
          { id: saved.id },
          'sampleNumber', // <--- this is the column name
          1,
        );

        expect(actual.affected).toBe(1);

        savedId = saved.id;

        const foundEntity = expectNotNullAndGet(
          await testBaseRepository.findSingle(saved.id),
        );
        expect(foundEntity?.sampleNumber).toBe(sampleNumber - 1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const decrementValue = await testBaseRepository.decrement(
          { id: savedId },
          'sampleNumber', // <--- this is the column name
          1,
        );
        expect(decrementValue.affected).toBe(0);
      },
    );
  });

  test('increment test', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        const sampleNumber = 10;

        const saved = await testBaseRepository.createOrUpdate({
          ...objectToSave,
          sampleNumber,
        });

        const actual = await testBaseRepository.increment(
          { id: saved.id },
          'sampleNumber',
          1,
        );

        expect(actual.affected).toBe(1);

        savedId = saved.id;

        const foundEntity = expectNotNullAndGet(
          await testBaseRepository.findSingle(saved.id),
        );
        expect(foundEntity?.sampleNumber).toBe(sampleNumber + 1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const decrementValue = await testBaseRepository.increment(
          { id: savedId },
          'sampleNumber', // <--- this is the column name
          1,
        );
        expect(decrementValue.affected).toBe(0);
      },
    );
  });

  test('deprecated methods throw exception', async () => {
    await expect(() =>
      testBaseRepository.findByIds([faker.string.uuid()]),
    ).rejects.toThrow();

    await expect(() =>
      testBaseRepository.findOneById(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      testBaseRepository.softDelete(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      testBaseRepository.softRemove({} as unknown as TestBaseEntity),
    ).rejects.toThrow();

    await expect(() =>
      testBaseRepository.restore(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      testBaseRepository.recover({} as unknown as TestBaseEntity),
    ).rejects.toThrow();
  });

  test('delete record from the db', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        const firstEntity = await testBaseRepository.createOrUpdate(
          objectToSave,
        );
        const secondEntity = await testBaseRepository.createOrUpdate(
          objectToSave,
        );

        savedId = secondEntity.id;

        const deleteResult = await testBaseRepository.delete(firstEntity.id);

        expect(deleteResult.affected).toBe(1);

        const foundEntity = await testBaseRepository.findSingle(firstEntity.id);
        expect(foundEntity).toBeNull();

        // the record should not be found with deleted flag
        const foundEntityWithDeleted = await testBaseRepository.findOne({
          where: {
            id: firstEntity.id,
          },
          withDeleted: true,
        });

        expect(foundEntityWithDeleted).toBeNull();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const deleteResult = await testBaseRepository.delete(savedId);
        expect(deleteResult.affected).toBe(0);
      },
    );
  });

  test('find all by tenant test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        await testBaseRepository.createOrUpdate(objectToSave);
        await testBaseRepository.createOrUpdate(objectToSave);

        const allEntities = await testBaseRepository.find();
        expect(allEntities.length).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const findAllForNotExistedTenant = await testBaseRepository.find();
        expect(findAllForNotExistedTenant.length).toBe(0);

        const findWithDefaultOptions = await testBaseRepository.find({
          take: 2,
        });

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
        await testBaseRepository.createOrUpdate(objectToSave);
        await testBaseRepository.createOrUpdate(objectToSave);

        const allEntities = await testBaseRepository.findBy({
          firstName: objectToSave.firstName,
        });

        expect(allEntities.length).toBe(2);

        const allEntitiesWithOr = await testBaseRepository.findBy([
          {
            firstName: objectToSave.firstName,
          },
          {
            lastName: objectToSave.lastName,
          },
        ]);

        expect(allEntitiesWithOr.length).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const allEntities = await testBaseRepository.findBy({
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
        await testBaseRepository.createOrUpdate(objectToSave);

        const entity = await testBaseRepository.findOneByOrFail({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();

        const entityWithOr = await testBaseRepository.findOneByOrFail([
          {
            firstName: objectToSave.firstName,
          },
          {
            lastName: objectToSave.lastName,
          },
        ]);

        expect(entityWithOr).toBeDefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        await expect(
          testBaseRepository.findOneByOrFail({
            firstName: objectToSave.firstName,
          }),
        ).rejects.toBeInstanceOf(EntityNotFoundError);
      },
    );
  });

  test('findOneBy by tenant', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        await testBaseRepository.createOrUpdate(objectToSave);

        const entity = await testBaseRepository.findOneBy({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();

        const entityWithOr = await testBaseRepository.findOneBy([
          {
            firstName: objectToSave.firstName,
          },
          {
            lastName: objectToSave.lastName,
          },
        ]);

        expect(entityWithOr).toBeDefined();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const entity = await testBaseRepository.findOneBy({
          firstName: objectToSave.firstName,
        });
        await expect(entity).toBeNull();
      },
    );
  });

  test('count by test with tenant', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        await testBaseRepository.createOrUpdate(objectToSave);
        await testBaseRepository.createOrUpdate(objectToSave);

        const allEntities = await testBaseRepository.count();
        expect(allEntities).toBe(2);

        const allEntitiesCountWithOr = await testBaseRepository.count({
          where: [
            { firstName: objectToSave.firstName },
            { lastName: objectToSave.lastName },
          ],
        });

        expect(allEntitiesCountWithOr).toBe(2);

        const allEntitiesCountWithAnd = await testBaseRepository.count({
          where: {
            firstName: objectToSave.firstName,
            lastName: objectToSave.lastName,
          },
        });

        expect(allEntitiesCountWithAnd).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const findAllForNotExistedTenant = await testBaseRepository.count();
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
        await testBaseRepository.createOrUpdate(objectToSave);

        const successFullyFind = await testBaseRepository.findOneOrFail({
          where: {
            firstName: objectToSave.firstName,
          },
        });
        expect(successFullyFind).not.toBeNull();

        await expect(
          testBaseRepository.findOneOrFail({
            where: {
              firstName: faker.person.firstName(),
            },
          }),
        ).rejects.toThrow();
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        await expect(
          testBaseRepository.findOneOrFail({
            where: {
              firstName: objectToSave.firstName,
            },
          }),
        ).rejects.toThrow();
      },
    );
  });

  test('find and count test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        await testBaseRepository.createOrUpdate(objectToSave);

        const successFindByFirstName = await testBaseRepository.findAndCountBy({
          firstName: objectToSave.firstName,
        });

        expect(successFindByFirstName[0].length).toBe(1);
        expect(successFindByFirstName[1]).toBe(1);

        const successFullyFindByLastName =
          await testBaseRepository.findAndCountBy([
            {
              firstName: objectToSave.firstName,
            },
            {
              lastName: objectToSave.lastName,
            },
          ]);

        expect(successFullyFindByLastName[0].length).toBe(1);
        expect(successFullyFindByLastName[1]).toBe(1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const successFullyFind = await testBaseRepository.findAndCountBy({
          firstName: objectToSave.firstName,
        });

        expect(successFullyFind[0].length).toBe(0);
        expect(successFullyFind[1]).toBe(0);
      },
    );
  });

  test('findAndCount simple test', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,

      },
      async () => {
        await testBaseRepository.createOrUpdate(objectToSave);

        const successFindByFirstName = await testBaseRepository.findAndCount({
          where: {
            firstName: objectToSave.firstName,
          },
        });

        expect(successFindByFirstName[0].length).toBe(1);
        expect(successFindByFirstName[1]).toBe(1);

        const successFullyFindByLastName =
          await testBaseRepository.findAndCount({
            where: [
              {
                firstName: objectToSave.firstName,
              },
              {
                lastName: objectToSave.lastName,
              },
            ],
          });

        expect(successFullyFindByLastName[0].length).toBe(1);
        expect(successFullyFindByLastName[1]).toBe(1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),

      },
      async () => {
        const successFullyFind = await testBaseRepository.findAndCount({
          where: {
            firstName: objectToSave.firstName,
          },
        });

        expect(successFullyFind[0].length).toBe(0);
        expect(successFullyFind[1]).toBe(0);
      },
    );
  });
});

@Entity()
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

  @Column({ type: Number, nullable: true })
  sampleNumber?: number;

  @Column({ type: String, nullable: true, length: 128 })
  nullableStringField?: string | null;

  @JoinColumn()
  tenant?: TenantEntity | null;
}

@Injectable()
class TestBaseRepository extends BaseTenantRepository<TestBaseEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TestBaseEntity, ds, clsService);
  }
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
class TenantRepository extends BaseRepository<TenantEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(TenantEntity, ds);
  }
}
