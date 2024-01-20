import {
  StartedDb,
  StartedRedis,
  startPostgres,
  startRedis,
} from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './app/config/root.config';
import * as path from 'node:path';

describe('start up fail cases', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;

  beforeAll(async () => {
    startedRedis = await startRedis();
    startedDb = await startPostgres();
  }, 60_000);

  afterAll(async () => {
    if (startedRedis) {
      await startedRedis.container.stop();
    }

    if (startedDb) {
      await startedDb.container.stop();
    }
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should start up successfully without any system jobs', async () => {
    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(
          path.join(__dirname, 'app'),
          RootConfig,
          'assets-no-system-jobs',
        ),
        AppModule,
      ],
    }).compile();

    const app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);
    await app.close();
  });
});
