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
import { FakeJob, FakeJobData } from './app/jobs/fake.job';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { generateRandomId } from '@softkit/crypto';
import { Queues } from './app/jobs/vo/queues.enum';

describe('jobs e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let fakeJobQueue: Queue<FakeJobData>;
  let fakeJob: FakeJob;
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

    fakeJobQueue = app.get(getQueueToken(Queues.FAKE_JOB));
    fakeJob = app.get(FakeJob);

    jobId = generateRandomId();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should execute job only once with the same job id', async () => {
    await fakeJobQueue.add(
      Queues.FAKE_JOB,
      { executeForMillis: 20 },
      {
        jobId,
      },
    );

    await wait(1000);

    await fakeJobQueue.add(
      Queues.FAKE_JOB,
      { executeForMillis: 25 },
      {
        jobId,
      },
    );

    await wait(1000);

    expect(fakeJob.startedProcessingCounter).toBe(1);
  });

  it('should execute scheduled job immediately', async () => {
    await fakeJobQueue.add(
      Queues.FAKE_JOB,
      { executeForMillis: 20 },
      {
        jobId,
        repeat: {
          // 1st january of every year
          pattern: '0 0 1 1 *',
          immediately: true,
        },
      },
    );

    await wait(1000);

    expect(fakeJob.startedProcessingCounter).toBe(1);
  });

  it('should execute scheduled job one time, even if added twice', async () => {
    await fakeJobQueue.add(
      Queues.FAKE_JOB,
      { executeForMillis: 500 },
      {
        jobId,
        repeat: {
          every: 1000,
        },
      },
    );

    await fakeJobQueue.add(
      Queues.FAKE_JOB,
      { executeForMillis: 20 },
      {
        jobId,
      },
    );

    await wait(400);

    expect(fakeJob.startedProcessingCounter).toBe(1);

    await wait(3000);

    expect(fakeJob.startedProcessingCounter).toBe(4);
  }, 10_000);
});
