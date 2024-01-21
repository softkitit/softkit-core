import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import { BaseBusyJob } from './base-busy.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
@Processor(Jobs.BUSY_SYSTEM_JOB, {
  concurrency: 1,
  maxStalledCount: 10,
})
export class BusySystemJob extends BaseBusyJob {
  protected override singleRunningJobGlobally = true;

  constructor(
    @InjectQueue(Jobs.BUSY_SYSTEM_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusySystemJob.name)
    logger: PinoLogger,
  ) {
    super(queue, logger);
  }
}
