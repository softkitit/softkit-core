import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { wait } from 'nx-cloud/lib/utilities/waiter';

export class FakeJobData {
  executeForMillis!: number;
}

@Processor('fake-job-queue', {
  concurrency: 50,
})
export class FakeJob extends WorkerHost {
  public callCounter: number = 0;

  constructor(@InjectQueue('fake-job-queue') private queue: Queue) {
    super();
  }

  override async process(job: Job<FakeJobData, number>): Promise<FakeJobData> {
    const hasActiveJobs = await this.hasOtherActiveJobsById(job);

    if (hasActiveJobs) {
      return job.data;
    }

    this.callCounter++;

    await wait(job.data.executeForMillis);

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
