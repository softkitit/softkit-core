import { StartedRedis, startRedis } from '@softkit/test-utils';
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

describe('jobs e2e tests', () => {
  let startedRedisPromise: StartedRedis;
  let app: NestFastifyApplication;
  let fakeJobQueue: Queue<FakeJobData>;
  let fakeJob: FakeJob;
  let jobId: string;

  beforeAll(async () => {
    startedRedisPromise = await startRedis();
  }, 60_000);

  afterAll(async () => {
    if (startedRedisPromise) {
      await startedRedisPromise.container.stop();
    }
  });

  beforeEach(async () => {
    const { JobsModule } = require('./app/jobs.module');

    const module = await Test.createTestingModule({
      imports: [JobsModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    fakeJobQueue = app.get(getQueueToken('fake-job-queue'));
    fakeJob = app.get(FakeJob);

    jobId = generateRandomId();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should auto schedule jobs and run 5 times', async () => {
    await fakeJobQueue.add('fake-job-queue', { executeForMillis: 1000 });
    await fakeJobQueue.add('fake-job-queue', { executeForMillis: 20 });

    await wait(2000);

    expect(fakeJob.callCounter).toBe(2);
  });

  it('should execute job only once with the same job id', async () => {
    await fakeJobQueue.add(
      'fake-job-name',
      { executeForMillis: 20 },
      {
        jobId,
      },
    );

    await wait(1000);

    await fakeJobQueue.add(
      'fake-job-name',
      { executeForMillis: 25 },
      {
        jobId,
      },
    );

    await wait(1000);

    expect(fakeJob.callCounter).toBe(1);
  });

  it('should execute scheduled job immediately', async () => {
    await fakeJobQueue.add(
      'fake-job-name',
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

    expect(fakeJob.callCounter).toBe(1);
  });

  it('should execute scheduled job and one time', async () => {
    await fakeJobQueue.add(
      'fake-job-name',
      { executeForMillis: 500 },
      {
        jobId,
        repeat: {
          every: 1000,
        },
      },
    );

    await fakeJobQueue.add(
      'fake-job-name',
      { executeForMillis: 20 },
      {
        jobId,
      },
    );

    await wait(400);

    expect(fakeJob.callCounter).toBe(1);

    await wait(3000);

    expect(fakeJob.callCounter).toBe(4);
  }, 10_000);

  it('should execute only one job at a time with overlap and concurrency bigger then 1', async () => {
    await fakeJobQueue.add(
      'fake-job-name',
      { executeForMillis: 3000 },
      {
        jobId,
        repeat: {
          every: 1000,
        },
      },
    );

    await wait(5000);

    expect(fakeJob.callCounter).toBe(2);
  }, 10_000);
});
