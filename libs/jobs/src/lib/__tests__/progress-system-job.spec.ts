import {
  StartedDb,
  StartedRedis,
  startPostgres,
  startRedis,
} from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getQueueToken } from '@nestjs/bull-shared/dist/utils/get-queue-token.util';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { JobDefinitionRepository } from '../repository';
import { Jobs } from './app/jobs/vo/jobs.enum';
import { BusyProgressSystemJob } from './app/jobs/busy-progress-system.job';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './app/config/root.config';
import path from 'node:path';

describe('progress system job e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let busyProgressSystemJob: BusyProgressSystemJob;
  let jobDefinitionRepository: JobDefinitionRepository;

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

    const module = await Test.createTestingModule({
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    busyProgressSystemJob = app.get(
      getQueueToken(Jobs.BUSY_PROGRESS_SYSTEM_JOB),
    );
    busyProgressSystemJob = app.get(BusyProgressSystemJob);
    jobDefinitionRepository = app.get(JobDefinitionRepository);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should auto schedule jobs and run 2 times', async () => {
    await wait(2100);
    expect(busyProgressSystemJob.jobStats.started).toBeGreaterThanOrEqual(2);
    const allJobs = await jobDefinitionRepository.find({
      where: {
        id: Jobs.BUSY_PROGRESS_SYSTEM_JOB,
      },
      relations: ['jobDataVersions'],
    });

    expect(allJobs.length).toBe(1);

    const job = allJobs[0];
    expect(job).toBeDefined();

    expect(job.queueName).toBe(Jobs.BUSY_PROGRESS_SYSTEM_JOB);
    expect(job.jobName).toBe(Jobs.BUSY_PROGRESS_SYSTEM_JOB);
    expect(job.id).toBe(Jobs.BUSY_PROGRESS_SYSTEM_JOB);

    expect(job?.jobDataVersions?.length).toBe(1);

    const jobVersion = job.jobDataVersions![0];
    expect(jobVersion.jobData).toStrictEqual({
      jobVersion: 1,
      executeForMillis: 900,
    });
    expect(jobVersion.jobDefinitionId).toBe(Jobs.BUSY_PROGRESS_SYSTEM_JOB);
    expect(jobVersion.jobVersion).toBe(1);
    // todo set proper
    expect(jobVersion.jobOptions).toBeDefined();
    expect(jobVersion.id).toBeDefined();
  });
});
