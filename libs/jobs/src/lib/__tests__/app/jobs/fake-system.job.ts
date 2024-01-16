import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { FakeJob, FakeJobData } from './fake.job';

@Processor(Jobs.FAKE_SYSTEM_JOB, {
  concurrency: 1,
  maxStalledCount: 10,
  connection: {},
})
export class FakeSystemJob extends FakeJob {
  constructor(@InjectQueue(Jobs.FAKE_SYSTEM_JOB) queue: Queue) {
    super(queue);
  }

  override async process(job: Job<FakeJobData, number>): Promise<FakeJobData> {
    return super.process(job);
  }
}
