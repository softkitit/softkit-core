import { Job } from 'bullmq';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { JobProcessor } from '../../../job';
import { BusyJobData } from './vo/busy-job-data.dto';

export class BaseBusyJob extends JobProcessor<BusyJobData> {
  public jobStats = {
    started: 0,
    finished: 0,
  };

  override async run(job: Job<BusyJobData>): Promise<void> {
    this.jobStats.started++;
    await wait(job.data.executeForMillis);
    this.jobStats.finished++;
  }
}
