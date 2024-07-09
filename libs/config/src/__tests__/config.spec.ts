import { setupYamlBaseConfigModule } from '../lib/yaml-config-module';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import path from 'node:path';
import { RootConfig } from './app/config/root.config';
import { SetupConfigOptions } from '../lib/vo/setup-config-options';
import { SwaggerConfig } from './app/config/test-swagger.config';
import crypto from 'node:crypto';
import { DEFAULT_CONFIGURATIONS_FOLDER_NAME } from '../lib/constants';

describe('Tests for config library', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
    process.env['NESTJS_PROFILES'] = 'test';
  });

  it('should handle profiles merging correctly', async () => {
    process.env['NESTJS_PROFILES'] = 'dev,local';

    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());

    const rootConfig = app.get(RootConfig);

    // local profile will override 'dev' profile
    expect(rootConfig.swagger.description).toEqual(
      'This is a test local application',
    );
    expect(rootConfig.swagger.title).toEqual('Local Application');

    // providing profiles in the options
    const profiles = ['local', 'dev'];
    const secondModule = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig, {
          profiles,
        }),
        AppModule,
      ],
    }).compile();

    app = secondModule.createNestApplication(new FastifyAdapter());

    const secondRootConfig = app.get(RootConfig);

    // dev profile will override 'local' profile
    expect(secondRootConfig.swagger.title).toEqual('Dev Application');
    expect(secondRootConfig.swagger.description).toEqual(
      'This is a test dev application',
    );

    const swaggerConfig = app.get(SwaggerConfig);
    expect(swaggerConfig).toEqual(secondRootConfig.swagger);
  });

  it('should handle correctly with no profiles', async () => {
    process.env['NESTJS_PROFILES'] = '';

    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());

    const rootConfig = app.get(RootConfig);
    expect(rootConfig.swagger.title).toEqual('Main Application');
    expect(rootConfig.swagger.description).toEqual(
      'This is a main application',
    );
  });

  it('should handle custom folder and base file name', async () => {
    const options = {
      folderName: 'assets-new',
      baseFileName: '.custom-env.yaml',
    } satisfies SetupConfigOptions;

    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(
          path.join(__dirname, 'app'),
          RootConfig,
          options,
        ),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());

    const rootConfig = app.get(RootConfig);
    expect(rootConfig.swagger.title).toEqual('Custom Application');
    expect(rootConfig.swagger.description).toEqual(
      'This is a custom application',
    );
  });

  it('should display warning message when specific configuration files do not exist', async () => {
    const options = {
      folderName: 'assets-new',
      baseFileName: '.custom-env.yaml',
    } satisfies SetupConfigOptions;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(
          path.join(__dirname, 'app'),
          RootConfig,
          options,
        ),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'The following configuration files were not found',
      ),
    );
  });

  it('should throw an error when specific folder does not exist', async () => {
    const randomUUID = crypto.randomUUID();
    const nonExistentDir = path.join(__dirname, `non-existent-${randomUUID}`);

    const { AppModule } = require('./app/app.module');

    let error: Error | unknown;

    try {
      const module = await Test.createTestingModule({
        imports: [
          setupYamlBaseConfigModule(nonExistentDir, RootConfig),
          AppModule,
        ],
      }).compile();

      app = module.createNestApplication(new FastifyAdapter());
    } catch (error_) {
      error = error_;
    }

    const errorMessage = `No configuration files found in "${nonExistentDir}/${DEFAULT_CONFIGURATIONS_FOLDER_NAME}". Please check your configuration.`;

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', errorMessage);
  });
});
