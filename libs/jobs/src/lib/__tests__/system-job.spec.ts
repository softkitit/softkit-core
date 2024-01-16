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
import { Queue } from 'bullmq';
import { FakeJobData } from './app/jobs/fake.job';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { generateRandomId } from '@softkit/crypto';
import { Jobs } from './app/jobs/vo/jobs.enum';
import { FakeSystemJob } from './app/jobs/fake-system.job';

describe('system jobs e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let fakeSystemJobQueue: Queue<FakeJobData>;
  let fakeSystemJob: FakeSystemJob;
  let jobId: string;

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

    fakeSystemJobQueue = app.get(getQueueToken(Jobs.FAKE_SYSTEM_JOB));
    fakeSystemJob = app.get(FakeSystemJob);

    jobId = generateRandomId();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should auto schedule jobs and run 2 times', async () => {
    await wait(2100);
    expect(fakeSystemJob.startedProcessingCounter).toBeGreaterThanOrEqual(2);
  });
});
