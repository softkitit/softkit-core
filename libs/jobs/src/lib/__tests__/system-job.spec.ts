import {
  StartedDb,
  StartedRedis,
  startPostgres,
  startRedis,
} from '@softkit/test-utils';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './app/config/root.config';
import * as path from 'node:path';

import { Jobs } from './app/jobs/vo/jobs.enum';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { BusySystemJob } from './app/jobs/busy-system.job';
import { BusyProgressSystemJob } from './app/jobs/busy-progress-system.job';
import { AbstractSchedulingJobService } from '../service';

describe('system job e2e', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let testingModule: TestingModule;
  let schedulingService: AbstractSchedulingJobService;

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

  beforeEach(async () => {
    const { AppModule } = require('./app/app.module');

    testingModule = await Test.createTestingModule({
      providers: [BusySystemJob],
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = testingModule.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    schedulingService = app.get(AbstractSchedulingJobService);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should schedule a system job and run it manually, and manual run should be skipped', async () => {
    const busySystemJob = testingModule.get<BusySystemJob>(BusySystemJob);

    await wait(1000);

    await schedulingService.runRepeatableJobNow(
      Jobs.BUSY_SYSTEM_JOB,
      Jobs.BUSY_SYSTEM_JOB,
      { executeForMillis: 20, jobVersion: 1 },
    );

    await wait(5000);

    expect(busySystemJob.jobStats.finished).toBe(1);
    expect(busySystemJob.jobStats.started).toBe(2);
  }, 10_000);

  it('should schedule a progress system job and run it manually, and manual run should be skipped', async () => {
    const busySystemJob = testingModule.get(BusyProgressSystemJob);

    await wait(300);

    for (let i = 0; i < 2; i++) {
      await schedulingService.runRepeatableJobNow(
        Jobs.BUSY_PROGRESS_SYSTEM_JOB,
        Jobs.BUSY_PROGRESS_SYSTEM_JOB,
        { executeForMillis: 600, jobVersion: 1 },
      );
    }

    await wait(2400);
    expect(busySystemJob.jobStats.started).toBe(2);
    expect(busySystemJob.jobStats.finished).toBe(2);
  }, 10_000);
});
