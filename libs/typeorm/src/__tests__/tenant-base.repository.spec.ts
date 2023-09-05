import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { ClsModule, ClsService } from 'nestjs-cls';
import { DataSource, DataSourceOptions, EntityNotFoundError } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { ClsPresetSubscriber } from '../lib/subscribers/cls-preset.subscriber';
import { TenantClsStore } from '../lib/vo/tenant-base-cls-store';
import { expectNotNullAndGet, startDb } from '@softkit/test-utils';
import { TenantRepository } from './app/tenant.repository';
import { TenantEntity } from './app/tenant.entity';
import { TenantUserEntity } from './app/test-base-tenant.entity';
import { TenantUserRepository } from './app/user-tenant-repository.service';
import { FilterOperator } from 'nestjs-paginate';
import { USER_PAGINATED_CONFIG } from './app/user.entity';

describe('tenant base entity test', () => {
  let userRepository: TenantUserRepository;
  let tenantRepository: TenantRepository;
  let clsService: ClsService<TenantClsStore>;
  let objectToSave: Partial<TenantUserEntity>;
  let createdTenant: TenantEntity;

  beforeAll(async () => {
    const { typeormOptions } = await startDb();

    @Injectable()
    class TypeOrmConfigService implements TypeOrmOptionsFactory {
      createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
          ...typeormOptions,
          subscribers: [],
          entities: [TenantUserEntity, TenantEntity],
          namingStrategy: new SnakeNamingStrategy(),
        } as TypeOrmModuleOptions;
      }
    }

    initializeTransactionalContext();

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TenantUserEntity, TenantEntity]),
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
        const saved = await userRepository.createOrUpdate(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(await userRepository.findSingle(saved.id));
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const actual = await userRepository.findSingle(savedId);
        expect(actual).toBeNull();
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
        const saved = await userRepository.createOrUpdate(objectToSave);
        savedEntityWithFirstTenant = saved;
        const updateResult = await userRepository.update(saved.id, {
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
        const saved = await userRepository.createOrUpdate(objectToSave);

        // update multiple records
        const updateResult = await userRepository.update(
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
        const saved = await userRepository.createOrUpdate(objectToSave);
        savedId = saved.id;
        expectNotNullAndGet(
          await userRepository.findOne({
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
        const actual = await userRepository.findOne({
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

        const saved = await userRepository.createOrUpdate({
          ...objectToSave,
          sampleNumber,
        });

        const actual = await userRepository.decrement(
          { id: saved.id },
          'sampleNumber', // <--- this is the column name
          1,
        );

        expect(actual.affected).toBe(1);

        savedId = saved.id;

        const foundEntity = expectNotNullAndGet(
          await userRepository.findSingle(saved.id),
        );
        expect(foundEntity?.sampleNumber).toBe(sampleNumber - 1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const decrementValue = await userRepository.decrement(
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

        const saved = await userRepository.createOrUpdate({
          ...objectToSave,
          sampleNumber,
        });

        const actual = await userRepository.increment(
          { id: saved.id },
          'sampleNumber',
          1,
        );

        expect(actual.affected).toBe(1);

        savedId = saved.id;

        const foundEntity = expectNotNullAndGet(
          await userRepository.findSingle(saved.id),
        );
        expect(foundEntity?.sampleNumber).toBe(sampleNumber + 1);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const decrementValue = await userRepository.increment(
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
      userRepository.findByIds([faker.string.uuid()]),
    ).rejects.toThrow();

    await expect(() =>
      userRepository.findOneById(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      userRepository.softDelete(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      userRepository.softRemove({} as unknown as TenantUserEntity),
    ).rejects.toThrow();

    await expect(() =>
      userRepository.restore(faker.string.uuid()),
    ).rejects.toThrow();

    await expect(() =>
      userRepository.recover({} as unknown as TenantUserEntity),
    ).rejects.toThrow();
  });

  test('delete record from the db', async () => {
    let savedId: string;

    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        const firstEntity = await userRepository.createOrUpdate(objectToSave);
        const secondEntity = await userRepository.createOrUpdate(objectToSave);

        savedId = secondEntity.id;

        const deleteResult = await userRepository.delete(firstEntity.id);

        expect(deleteResult.affected).toBe(1);

        const foundEntity = await userRepository.findSingle(firstEntity.id);
        expect(foundEntity).toBeNull();

        // the record should not be found with deleted flag
        const foundEntityWithDeleted = await userRepository.findOne({
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
        const deleteResult = await userRepository.delete(savedId);
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
        await userRepository.createOrUpdate(objectToSave);
        await userRepository.createOrUpdate(objectToSave);

        const allEntities = await userRepository.find();
        expect(allEntities.length).toBe(2);
      },
    );

    await clsService.runWith(
      {
        tenantId: faker.string.uuid(),
      },
      async () => {
        const findAllForNotExistedTenant = await userRepository.find();
        expect(findAllForNotExistedTenant.length).toBe(0);

        const findWithDefaultOptions = await userRepository.find({
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
        await userRepository.createOrUpdate(objectToSave);
        await userRepository.createOrUpdate(objectToSave);

        const allEntities = await userRepository.findBy({
          firstName: objectToSave.firstName,
        });

        expect(allEntities.length).toBe(2);

        const allEntitiesWithOr = await userRepository.findBy([
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
        const allEntities = await userRepository.findBy({
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
        await userRepository.createOrUpdate(objectToSave);

        const entity = await userRepository.findOneByOrFail({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();

        const entityWithOr = await userRepository.findOneByOrFail([
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
          userRepository.findOneByOrFail({
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
        await userRepository.createOrUpdate(objectToSave);

        const entity = await userRepository.findOneBy({
          firstName: objectToSave.firstName,
        });

        expect(entity).toBeDefined();

        const entityWithOr = await userRepository.findOneBy([
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
        const entity = await userRepository.findOneBy({
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
        await userRepository.createOrUpdate(objectToSave);
        await userRepository.createOrUpdate(objectToSave);

        const allEntities = await userRepository.count();
        expect(allEntities).toBe(2);

        const allEntitiesCountWithOr = await userRepository.count({
          where: [
            { firstName: objectToSave.firstName },
            { lastName: objectToSave.lastName },
          ],
        });

        expect(allEntitiesCountWithOr).toBe(2);

        const allEntitiesCountWithAnd = await userRepository.count({
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
        await userRepository.createOrUpdate(objectToSave);

        const successFullyFind = await userRepository.findOneOrFail({
          where: {
            firstName: objectToSave.firstName,
          },
        });
        expect(successFullyFind).not.toBeNull();

        await expect(
          userRepository.findOneOrFail({
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
          userRepository.findOneOrFail({
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
        await userRepository.createOrUpdate(objectToSave);

        const successFindByFirstName = await userRepository.findAndCountBy({
          firstName: objectToSave.firstName,
        });

        expect(successFindByFirstName[0].length).toBe(1);
        expect(successFindByFirstName[1]).toBe(1);

        const successFullyFindByLastName = await userRepository.findAndCountBy([
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
        const successFullyFind = await userRepository.findAndCountBy({
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
        await userRepository.createOrUpdate(objectToSave);

        const successFindByFirstName = await userRepository.findAndCount({
          where: {
            firstName: objectToSave.firstName,
          },
        });

        expect(successFindByFirstName[0].length).toBe(1);
        expect(successFindByFirstName[1]).toBe(1);

        const successFullyFindByLastName = await userRepository.findAndCount({
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
        const successFullyFind = await userRepository.findAndCount({
          where: {
            firstName: objectToSave.firstName,
          },
        });

        expect(successFullyFind[0].length).toBe(0);
        expect(successFullyFind[1]).toBe(0);
      },
    );
  });

  test('findAllPaginated test with pre-setting tenant id', async () => {
    await clsService.runWith(
      {
        tenantId: createdTenant.id,
      },
      async () => {
        await userRepository.createOrUpdate(objectToSave);

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
});
