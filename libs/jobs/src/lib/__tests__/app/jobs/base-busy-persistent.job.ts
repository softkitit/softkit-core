import { Job } from 'bullmq';
import { wait } from 'nx-cloud/lib/utilities/waiter';
import { PersistentJobProcessor } from '../../../job';
import { BusyJobData } from './vo/busy-job-data.dto';

import { BaseJobVersion } from '../../../entity';

export class BaseBusyPersistentJob extends PersistentJobProcessor<BusyJobData> {
  public jobStats = {
    started: 0,
    skip: 0,
    finished: 0,
  };

  override async runWithTracking(
    job: Job<BusyJobData>,
    jobVersion: BaseJobVersion,
  ): Promise<void> {
    this.jobStats.started++;
    for (let i = 1; i < 10; i++) {
      await wait(job.data.executeForMillis / 10);
      await this.trackJobProgress(jobVersion, i * 10);
    }
    this.jobStats.finished++;
  }
}
