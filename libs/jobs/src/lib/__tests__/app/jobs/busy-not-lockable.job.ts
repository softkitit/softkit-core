import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BaseBusyJob } from './base-busy.job';

// @ts-ignore
@Processor(Jobs.BUSY_NOT_LOCKABLE_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyNotLockableJob extends BaseBusyJob {
  override singleRunningJobGlobally = true;

  constructor(
    @InjectQueue(Jobs.BUSY_NOT_LOCKABLE_JOB)
    queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyNotLockableJob.name)
    logger: PinoLogger,
  ) {
    super(queue, logger);
  }

  protected override async acquireLock(
    jobId: string,
    lockFor: number = 30_000,
  ): Promise<boolean> {
    return false;
  }
}
