import {
  StartedDb,
  StartedRedis,
  startPostgres,
  startRedis,
} from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import * as process from 'node:process';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './app/config/root.config';
import * as path from 'node:path';
import { JobVersionService } from '../service/job-version.service';
import {
  AbstractJobDefinitionService,
  AbstractJobVersionService,
  JobDefinitionService,
} from '../service';
import { Jobs } from './app/jobs/vo/jobs.enum';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BusyJobData } from './app/jobs/vo/busy-job-data.dto';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { BusyProgressSystemJob } from './app/jobs/busy-progress-system.job';

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

  it.each([
    'test',
    'test,no-system-jobs',
    'test,no-system-jobs,clear-db',
    'test,clear-db',
  ])(
    'should start up successfully 2 times, with assets: %s',
    async (profiles: string) => {
      process.env['NESTJS_PROFILES'] = profiles;

      const { AppModule } = require('./app/app.module');

      const metadata = {
        imports: [
          setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
          AppModule,
        ],
      };

      const module = await Test.createTestingModule(metadata).compile();
      const app = module.createNestApplication(new FastifyAdapter());
      await app.listen(0);
      await app.close();

      const moduleSecond = await Test.createTestingModule(metadata).compile();
      const appSecond = moduleSecond.createNestApplication(
        new FastifyAdapter(),
      );
      await appSecond.listen(0);
      await appSecond.close();
    },
  );

  it('should reschedule system job if a version changed', async () => {
    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    const app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    const jobDefinitionService = app.get<JobDefinitionService>(
      AbstractJobDefinitionService,
    );
    const jobVersionService = app.get<JobVersionService>(
      AbstractJobVersionService,
    );

    const jobDefinition = await jobDefinitionService.findOneById(
      Jobs.BUSY_PROGRESS_SYSTEM_JOB,
    );

    expect(jobDefinition).toBeDefined();

    const jobVersions = await jobVersionService.findAll(1, 20, {
      jobDefinitionId: jobDefinition?.id,
    });

    expect(jobVersions.length).toBe(1);

    await app.close();

    process.env['NESTJS_PROFILES'] = 'test,system-job-v2';

    const moduleUpdated = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    const appUpdated = moduleUpdated.createNestApplication(
      new FastifyAdapter(),
    );
    await appUpdated.listen(0);

    const updatedJobVersions = await jobVersionService.findAll(1, 20, {
      jobDefinitionId: jobDefinition?.id,
    });

    expect(updatedJobVersions.length).toBe(2);
  });

  it('should pause and resume system job queue', async () => {
    const { AppModule } = require('./app/app.module');

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    const app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    const busySystemJobQueue = app.get<Queue<BusyJobData>>(
      getQueueToken(Jobs.BUSY_PROGRESS_SYSTEM_JOB),
    );

    const busyProgressSystemJob = app.get(BusyProgressSystemJob);

    await wait(900);

    await busySystemJobQueue.pause();
    expect(busyProgressSystemJob.jobStats.started).toBe(1);

    await wait(2000);

    expect(busyProgressSystemJob.jobStats.started).toBe(1);
    expect(busyProgressSystemJob.jobStats.finished).toBe(1);

    await busySystemJobQueue.resume();

    await wait(900);
    expect(busyProgressSystemJob.jobStats.started).toBe(2);
  });
});
