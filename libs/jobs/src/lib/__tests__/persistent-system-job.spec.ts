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
import { JobDefinitionRepository, JobVersionRepository } from '../repository';
import { Jobs } from './app/jobs/vo/jobs.enum';
import { BusyPersistentSystemJob } from './app/jobs/busy-persistent-system.job';

describe('persistent system job e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let busyPersistentSystemJob: BusyPersistentSystemJob;
  let jobDefinitionRepository: JobDefinitionRepository;
  let jobVersionRepository: JobVersionRepository;

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
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    busyPersistentSystemJob = app.get(
      getQueueToken(Jobs.BUSY_PERSISTENT_SYSTEM_JOB),
    );
    busyPersistentSystemJob = app.get(BusyPersistentSystemJob);
    jobDefinitionRepository = app.get(JobDefinitionRepository);
    jobVersionRepository = app.get(JobVersionRepository);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should auto schedule jobs and run 2 times', async () => {
    await wait(2100);
    expect(busyPersistentSystemJob.jobStats.started).toBeGreaterThanOrEqual(2);
    const allJobs = await jobDefinitionRepository.find({
      where: {
        id: Jobs.BUSY_PERSISTENT_SYSTEM_JOB,
      },
    });

    expect(allJobs.length).toBe(1);

    const job = allJobs[0];
    expect(job).toBeDefined();

    expect(job.queueName).toBe(Jobs.BUSY_PERSISTENT_SYSTEM_JOB);
    expect(job.jobName).toBe(Jobs.BUSY_PERSISTENT_SYSTEM_JOB);
    expect(job.id).toBe(Jobs.BUSY_PERSISTENT_SYSTEM_JOB);

    const jobDataVersions = await jobVersionRepository.find({
      where: {
        jobDefinitionId: Jobs.BUSY_PERSISTENT_SYSTEM_JOB,
      },
    });
    expect(jobDataVersions?.length).toBe(1);

    const jobVersion = jobDataVersions![0];
    expect(jobVersion.jobData).toStrictEqual({
      jobVersion: 1,
      executeForMillis: 900,
    });
    expect(jobVersion.jobDefinitionId).toBe(Jobs.BUSY_PERSISTENT_SYSTEM_JOB);
    expect(jobVersion.jobVersion).toBe(1);
    // todo set proper
    expect(jobVersion.jobOptions).toBeDefined();
    expect(jobVersion.id).toBeDefined();
  });
});
