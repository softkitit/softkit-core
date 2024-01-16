import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { FakeJob, FakeJobData } from './fake.job';
import { Queues } from './vo/queues.enum';

// @ts-ignore
@Processor(Queues.FAKE_SYSTEM_JOB, {
  concurrency: 1,
  maxStalledCount: 10,
})
export class FakeSystemJob extends FakeJob {
  constructor(@InjectQueue(Queues.FAKE_SYSTEM_JOB) queue: Queue) {
    super(queue);
  }

  override async process(job: Job<FakeJobData, number>): Promise<FakeJobData> {
    return super.process(job);
  }
}
