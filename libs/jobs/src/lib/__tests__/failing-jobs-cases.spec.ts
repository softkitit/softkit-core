import {
  expectNotNullAndGet,
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
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AlwaysFailingJob } from './app/jobs/always-failing.job';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { AlwaysFailingProgressJob } from './app/jobs/always-failing-progress.job';
import { BusyNotScheduledProgressJob } from './app/jobs/busy-not-scheduled-progress.job';
import { BusyNotScheduledJob } from './app/jobs/busy-not-scheduled.job';
import { BusyNotLockableJob } from './app/jobs/busy-not-lockable.job';

describe('failing jobs e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let testingModule: TestingModule;

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
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = testingModule.createNestApplication(new FastifyAdapter());
    await app.listen(0);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should schedule and run always failing job with retries', async () => {
    const alwaysFailingQueue = testingModule.get<Queue>(
      getQueueToken(Jobs.ALWAYS_FAILING_JOB),
    );

    const failingJob = testingModule.get<AlwaysFailingJob>(AlwaysFailingJob);

    await alwaysFailingQueue.add(
      Jobs.ALWAYS_FAILING_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_JOB,
      },
    );

    await wait(1000);

    expect(failingJob.jobStats.executed).toBe(2);

    // schedule second failing job
    await alwaysFailingQueue.add(
      Jobs.ALWAYS_FAILING_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_JOB,
      },
    );

    await wait(2000);

    expect(failingJob.jobStats.executed).toBe(5);
  });

  it.skip('should schedule and run always failing progress job with retries', async () => {
    const alwaysFailingProgressQueue = testingModule.get<Queue>(
      getQueueToken(Jobs.ALWAYS_FAILING_PROGRESS_JOB),
    );

    const job = testingModule.get<AlwaysFailingProgressJob>(
      AlwaysFailingProgressJob,
    );

    await alwaysFailingProgressQueue.add(
      Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      },
    );

    await wait(2000);

    expect(job.jobStats.executed).toBe(2);

    // schedule second failing job
    await alwaysFailingProgressQueue.add(
      Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      },
    );

    await wait(2000);

    expect(job.jobStats.executed).toBe(5);
  });

  it(`should schedule a progress job manually, but it will fail because it wasn't added to db, without retries`, async () => {
    const notScheduledJobQueue = testingModule.get<Queue>(
      getQueueToken(Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB),
    );

    const job = testingModule.get<BusyNotScheduledProgressJob>(
      BusyNotScheduledProgressJob,
    );

    await notScheduledJobQueue.add(
      Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB,
      },
    );

    await wait(1000);
    expect(job).toBeDefined();

    const jobInfoInRedis = expectNotNullAndGet(
      await notScheduledJobQueue.getJob(Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB),
    );

    expect(jobInfoInRedis.stacktrace.length).toBe(1);
    expect(jobInfoInRedis.attemptsStarted).toBe(1);
    expect(jobInfoInRedis.attemptsMade).toBe(1);
    expect(jobInfoInRedis.failedReason).toContain(
      `wasn't saved to a persistent db`,
    );
  });

  it(`should schedule a job manually, with not supported payload version`, async () => {
    const notScheduledJobQueue = testingModule.get<Queue>(
      getQueueToken(Jobs.BUSY_NOT_SCHEDULED_JOB),
    );

    const job = testingModule.get<BusyNotScheduledJob>(BusyNotScheduledJob);

    await notScheduledJobQueue.add(
      Jobs.BUSY_NOT_SCHEDULED_JOB,
      { executeForMillis: 20, jobVersion: -1 },
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.BUSY_NOT_SCHEDULED_JOB,
      },
    );

    await wait(1000);
    expect(job).toBeDefined();

    const jobInfoInRedis = expectNotNullAndGet(
      await notScheduledJobQueue.getJob(Jobs.BUSY_NOT_SCHEDULED_JOB),
    );

    expect(jobInfoInRedis.stacktrace.length).toBe(1);
    expect(jobInfoInRedis.attemptsStarted).toBe(1);
    expect(jobInfoInRedis.attemptsMade).toBe(1);
    expect(jobInfoInRedis.failedReason).toContain(
      `The job version for job is not supported by worker`,
    );
  });

  it(`should schedule a job manually, that failing to get lock, should run with retries`, async () => {
    const queue = testingModule.get<Queue>(
      getQueueToken(Jobs.BUSY_NOT_LOCKABLE_JOB),
    );

    const job = testingModule.get(BusyNotLockableJob);

    await queue.add(
      Jobs.BUSY_NOT_LOCKABLE_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.BUSY_NOT_LOCKABLE_JOB,
      },
    );

    await wait(1000);
    expect(job).toBeDefined();

    const jobInfoInRedis = expectNotNullAndGet(
      await queue.getJob(Jobs.BUSY_NOT_LOCKABLE_JOB),
    );

    expect(jobInfoInRedis.stacktrace.length).toBe(2);
    expect(jobInfoInRedis.attemptsStarted).toBe(2);
    expect(jobInfoInRedis.attemptsMade).toBe(2);
    expect(jobInfoInRedis.failedReason).toContain(
      `Failed to acquire lock for job`,
    );
  });

  it.skip('should schedule and run always failing progress job with retries', async () => {
    const alwaysFailingProgressQueue = testingModule.get<Queue>(
      getQueueToken(Jobs.ALWAYS_FAILING_PROGRESS_JOB),
    );

    const job = testingModule.get<AlwaysFailingProgressJob>(
      AlwaysFailingProgressJob,
    );

    await alwaysFailingProgressQueue.add(
      Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      },
    );

    await wait(2000);

    expect(job.jobStats.executed).toBe(2);

    // schedule second failing job
    await alwaysFailingProgressQueue.add(
      Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      { executeForMillis: 20, jobVersion: 1 },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 1,
        },
        jobId: Jobs.ALWAYS_FAILING_PROGRESS_JOB,
      },
    );

    await wait(2000);

    expect(job.jobStats.executed).toBe(5);
  });
});
