import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { bootstrapBaseWebApp } from '../lib/setup-web-app';
import { SwaggerConfig } from '@softkit/swagger-utils';
import { RootConfig } from './app/config/root.config';
import { AppConfig } from '../lib/config/app';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { setupYamlBaseConfigModule } from '@softkit/config';
import * as path from 'node:path';
import { BootstrapTestAppModule } from './app/app.module';
import {
  DbConfig,
  setupTypeormModule,
  TYPEORM_FACTORIES_TOKEN,
  TYPEORM_SEEDERS_TOKEN,
} from '@softkit/typeorm';
import { TenantRepository } from './app/repositories/tenant.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './app/repositories/tenant.entity';
import * as Seeders from './app/seeders';
import * as Factories from './app/factories';

describe('bootstrap test', () => {
  let db: StartedDb;
  let dbConfig: DbConfig;
  let swaggerConfig: SwaggerConfig;
  let appConfig: AppConfig;
  let rootConfig: RootConfig;
  let testingModuleMetadata: ModuleMetadata;
  let tenantRepository: TenantRepository;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [TenantEntity],
        namingStrategy: new SnakeNamingStrategy(),
      },
      setupTransactionsManagement: false,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    const configModule = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
      ],
    }).compile();

    await configModule.init();

    rootConfig = configModule.get(RootConfig);
    swaggerConfig = configModule.get(SwaggerConfig);
    appConfig = configModule.get(AppConfig);
    dbConfig = configModule.get(DbConfig);

    const { BootstrapTestAppModule } = require('./app/app.module');

    testingModuleMetadata = {
      providers: [
        {
          provide: RootConfig,
          useValue: rootConfig,
        },
        {
          provide: SwaggerConfig,
          useValue: swaggerConfig,
        },
        {
          provide: AppConfig,
          useValue: appConfig,
        },
        {
          provide: DbConfig,
          useValue: dbConfig,
        },
        {
          provide: TYPEORM_SEEDERS_TOKEN,
          useValue: Object.values(Seeders),
        },
        {
          provide: TYPEORM_FACTORIES_TOKEN,
          useValue: Object.values(Factories),
        },
        TenantRepository,
      ],
      imports: [
        BootstrapTestAppModule,
        TypeOrmModule.forFeature([TenantEntity]),
        setupTypeormModule(__dirname, db.TypeOrmConfigService),
      ],
    };
  });

  describe('swagger setup', () => {
    it('should expect undefined swagger setup when it is disabled', async () => {
      swaggerConfig.enabled = false;

      const testingModule = await Test.createTestingModule(
        testingModuleMetadata,
      ).compile();

      const app = await bootstrapBaseWebApp(
        testingModule,
        BootstrapTestAppModule,
      );
      const response = await app.inject({
        method: 'GET',
        url: swaggerConfig.swaggerPath,
      });

      expect(response.statusCode).toBe(404);
    });

    it('should expect correct swagger setup when it is enabled', async () => {
      const testingModule = await Test.createTestingModule(
        testingModuleMetadata,
      ).compile();

      const app = await bootstrapBaseWebApp(
        testingModule,
        BootstrapTestAppModule,
      );

      const adjustedSwaggerPath = `/${appConfig.prefix}${swaggerConfig.swaggerPath}`;

      const response = await app.inject({
        method: 'GET',
        url: adjustedSwaggerPath,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('<div id="swagger-ui"></div>');
    });

    it('should work properly without swagger config in context', async () => {
      const testingModule = await Test.createTestingModule({
        providers: [
          {
            provide: RootConfig,
            useValue: rootConfig,
          },
          {
            provide: AppConfig,
            useValue: appConfig,
          },
          {
            provide: DbConfig,
            useValue: dbConfig,
          },
        ],
        imports: [BootstrapTestAppModule],
      }).compile();

      const app = await bootstrapBaseWebApp(
        testingModule,
        BootstrapTestAppModule,
      );
      const adjustedSwaggerPath = `/${appConfig.prefix}${swaggerConfig.swaggerPath}`;

      const response = await app.inject({
        method: 'GET',
        url: adjustedSwaggerPath,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  it('should work without prefix in app config', async () => {
    appConfig.prefix = '';

    const testingModule = await Test.createTestingModule(
      testingModuleMetadata,
    ).compile();

    const app = await bootstrapBaseWebApp(
      testingModule,
      BootstrapTestAppModule,
    );
    expect(app).toBeDefined();
  });

  it('should create proper prefixed swagger path with prefix in app config', async () => {
    const appPrefix = 'random';
    appConfig.prefix = appPrefix;

    const testingModule = await Test.createTestingModule(
      testingModuleMetadata,
    ).compile();

    const app = await bootstrapBaseWebApp(
      testingModule,
      BootstrapTestAppModule,
    );

    const adjustedSwaggerPath = `/${appPrefix}${swaggerConfig.swaggerPath}`;

    const response = await app.inject({
      method: 'GET',
      url: adjustedSwaggerPath,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<div id="swagger-ui"></div>');
  });

  it('should fail starting test app without providing original module', async () => {
    const testingModule = await Test.createTestingModule({}).compile();

    await expect(bootstrapBaseWebApp(testingModule)).rejects.toThrow(
      'If you are using TestingModule, you must pass the original module as the second argument',
    );
  });

  it('should start test app using provided module as fallback', async () => {
    const { TestAppModule } = require('./app/app.module');
    await bootstrapBaseWebApp(TestAppModule);
  });

  it('should seed database', async () => {
    dbConfig.runSeeds = true;

    const testingModule = await Test.createTestingModule(
      testingModuleMetadata,
    ).compile();

    tenantRepository = testingModule.get(TenantRepository);

    await bootstrapBaseWebApp(testingModule, BootstrapTestAppModule);
    const tenantsCount = await tenantRepository.count();
    expect(tenantsCount).toBe(1);
  });

  it('should not seed database in case we do not have seeders', async () => {
    dbConfig.runSeeds = true;

    const testingModule = await Test.createTestingModule({
      ...testingModuleMetadata,
      providers: [
        ...(testingModuleMetadata.providers || []),
        {
          provide: TYPEORM_SEEDERS_TOKEN,
          useValue: [],
        },
        {
          provide: TYPEORM_FACTORIES_TOKEN,
          useValue: [],
        },
      ],
    }).compile();

    tenantRepository = testingModule.get(TenantRepository);

    await bootstrapBaseWebApp(testingModule, BootstrapTestAppModule);
  });
});
