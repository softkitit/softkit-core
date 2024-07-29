import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  ClsPresetSubscriber,
  OptimisticLockingSubscriber,
  setupTypeormModule,
} from '@softkit/typeorm';
import { TenantEntity } from './app/entity/tenant.entity';
import { TenantRepository } from './app/repository/tenant.repository';
import { TenantService } from './app/service/tenant.service';
import { ClsService } from 'nestjs-cls';

describe('base tenant service tests', () => {
  let tenantService: TenantService;
  let clsService: ClsService<{
    tenantId?: string;
  }>;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [TenantEntity],
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
        TypeOrmModule.forFeature([TenantEntity]),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],
      providers: [
        TenantRepository,
        TenantService,
        OptimisticLockingSubscriber,
        ClsPresetSubscriber,
      ],
    }).compile();

    tenantService = module.get<TenantService>(TenantService);
    clsService = module.get<ClsService>(ClsService);
  });

  test('create one test', async () => {
    const tenantId = faker.string.uuid();
    await clsService.runWith(
      {
        tenantId,
      },
      async () => {
        const objectToSave = {
          companyWebsite: 'https://softkit.io',
          companyName: 'softkit',
          directorName: 'softkit',
          version: 1,
        };

        const savedEntity = await tenantService.upsert(objectToSave);

        expect(savedEntity.createdAt.getTime()).toBeLessThan(Date.now());
        expect(savedEntity.updatedAt.getTime()).toBeLessThan(Date.now());
        expect(savedEntity.deletedAt).toBeNull();

        const { createdAt, updatedAt, deletedAt, ...other } = savedEntity;

        expect(other).toStrictEqual({
          ...objectToSave,
          tenantId,
          version: 1,
        });
      },
    );
  });
});
