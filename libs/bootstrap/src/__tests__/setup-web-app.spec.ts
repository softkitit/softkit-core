import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { setupTypeormModule } from '@softkit/typeorm';
import { bootstrapBaseWebApp } from '../lib/setup-web-app';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { setupSwagger, SwaggerConfig } from '@softkit/swagger-utils';
import { RootConfig } from './app/config/root.config';
import { OpenAPIObject } from '@nestjs/swagger';
import { BootstrapTestAppModule } from './app/app.module';
import { TestingModule } from '@nestjs/testing/testing-module';
import * as transactionalContext from 'typeorm-transactional';
import * as getTransactionalContext from 'typeorm-transactional/dist/common';

describe('bootstrap test', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;
  let db: StartedDb;
  let swaggerConfig: SwaggerConfig;
  let appConfig: RootConfig;
  let swaggerSetup: OpenAPIObject | undefined;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        namingStrategy: new SnakeNamingStrategy(),
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    app.flushLogs();
    await app.close();
  });

  beforeEach(async () => {
    const { BootstrapTestAppModule } = require('./app/app.module');
    moduleRef = await Test.createTestingModule({
      imports: [
        BootstrapTestAppModule,
        setupTypeormModule(__dirname, db.TypeOrmConfigService),
      ],
    }).compile();

    app = await bootstrapBaseWebApp(moduleRef, BootstrapTestAppModule);

    appConfig = app.get(RootConfig);
    swaggerConfig = app.get(SwaggerConfig);
  });

  it('should expect defined swagger config', () => {
    expect(swaggerConfig).toBeDefined();
  });

  it('should expect defined app config', () => {
    expect(appConfig).toBeDefined();
  });

  it('should expect undefined swagger setup when it is disabled', async () => {
    swaggerSetup = setupSwagger(swaggerConfig, app);
    expect(swaggerSetup).toBeUndefined();
  });

  it('should expect correct swagger setup when it is enabled', async () => {
    appConfig.swaggerConfig.enabled = true;

    app = await bootstrapBaseWebApp(moduleRef, BootstrapTestAppModule);

    const response = await app.inject({
      method: 'GET',
      url: swaggerConfig.swaggerPath,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<div id="swagger-ui"></div>');
  });

  it('should initialize transactional context if none exists', async () => {
    jest
      .spyOn(getTransactionalContext, 'getTransactionalContext')
      // eslint-disable-next-line unicorn/no-useless-undefined
      .mockReturnValue(undefined);
    const initializeMock = jest
      .spyOn(transactionalContext, 'initializeTransactionalContext')
      .mockImplementation(() => ({}) as any);

    app = await bootstrapBaseWebApp(moduleRef, BootstrapTestAppModule);

    expect(initializeMock).toHaveBeenCalled();
  });
});
