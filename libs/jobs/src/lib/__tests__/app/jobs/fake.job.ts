import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { Queues } from './vo/queues.enum';

export class FakeJobData {
  executeForMillis!: number;
}

// @ts-ignore
@Processor(Queues.FAKE_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class FakeJob extends WorkerHost {
  public startedProcessingCounter: number = 0;
  public finishedProcessingCounter: number = 0;
  public skipCount: number = 0;

  constructor(@InjectQueue(Queues.FAKE_JOB) private queue: Queue) {
    super();
  }

  override async process(job: Job<FakeJobData, number>): Promise<FakeJobData> {
    // eslint-disable-next-line no-console
    console.log('token', job.asJSON());
    const hasActiveJobs = await this.hasOtherActiveJobsById(job);

    if (hasActiveJobs) {
      this.skipCount++;
      return job.data;
    }

    this.startedProcessingCounter++;

    await wait(job.data.executeForMillis);

    this.finishedProcessingCounter++;

    return job.data;
  }

  // eslint-disable-next-line complexity
  private async hasOtherActiveJobsById(
    job: Job<FakeJobData, number>,
  ): Promise<boolean> {
    const currentJobId = job.opts.repeat?.jobId ?? job.opts.jobId;
    const BATCH_SIZE = 100;

    let activeJobsCount = 0;
    for (let i = 0; ; i++) {
      const activeJobs = await this.queue.getJobs(
        ['active'],
        i * BATCH_SIZE,
        BATCH_SIZE,
        true,
      );

      for (const activeJob of activeJobs) {
        const jobOptions = activeJob.opts;
        if (
          jobOptions.repeat?.jobId === currentJobId ||
          jobOptions.jobId === currentJobId
        ) {
          activeJobsCount++;
          if (activeJobsCount > 1) {
            return true;
          }
        }
      }

      if (activeJobs.length < BATCH_SIZE) {
        return false;
      }
    }
  }
}
