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
import { BusyJob } from './app/jobs/busy.job';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { generateRandomId } from '@softkit/crypto';
import { Jobs } from './app/jobs/vo/jobs.enum';
import { BusyJobData } from './app/jobs/vo/busy-job-data.dto';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './app/config/root.config';
import path from 'node:path';
import { AbstractSchedulingJobService } from '../service';

describe('busy job e2e tests', () => {
  let startedRedis: StartedRedis;
  let startedDb: StartedDb;
  let app: NestFastifyApplication;
  let fakeJobQueue: Queue<BusyJobData>;
  let schedulingService: AbstractSchedulingJobService;
  let fakeJob: BusyJob;
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
      imports: [
        setupYamlBaseConfigModule(path.join(__dirname, 'app'), RootConfig),
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    fakeJobQueue = app.get(getQueueToken(Jobs.BUSY_JOB));
    fakeJob = app.get(BusyJob);
    schedulingService = app.get(AbstractSchedulingJobService);

    jobId = generateRandomId();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should execute scheduled job immediately', async () => {
    await schedulingService.scheduleJob(
      Jobs.BUSY_JOB,
      Jobs.BUSY_JOB,
      jobId,
      { executeForMillis: 20, jobVersion: 1 },
      {
        repeat: {
          // 1st january of every year
          pattern: '0 0 1 1 *',
          immediately: true,
        },
      },
    );
    await wait(1000);

    expect(fakeJob.jobStats.started).toBe(1);
    expect(fakeJob.jobStats.finished).toBe(1);

    for (let i = 0; i < 2; i++) {
      await schedulingService.runRepeatableJobNow(Jobs.BUSY_JOB, jobId);
    }

    await wait(1000);

    expect(fakeJob.jobStats.started).toBe(2);
    expect(fakeJob.jobStats.finished).toBe(2);
  });
});
