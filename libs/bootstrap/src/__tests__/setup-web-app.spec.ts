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

describe('bootstrap test', () => {
  let db: StartedDb;
  let swaggerConfig: SwaggerConfig;
  let appConfig: AppConfig;
  let rootConfig: RootConfig;
  let testingModuleMetadata: ModuleMetadata;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
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

    rootConfig = configModule.get(RootConfig);
    swaggerConfig = configModule.get(SwaggerConfig);
    appConfig = configModule.get(AppConfig);

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
      ],
      imports: [BootstrapTestAppModule],
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
});
