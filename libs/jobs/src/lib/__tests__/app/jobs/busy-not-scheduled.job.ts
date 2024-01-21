import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import { BaseBusyJob } from './base-busy.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
@Processor(Jobs.BUSY_NOT_SCHEDULED_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyNotScheduledJob extends BaseBusyJob {
  constructor(
    @InjectQueue(Jobs.BUSY_NOT_SCHEDULED_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyNotScheduledJob.name)
    logger: PinoLogger,
  ) {
    super(queue, logger);
  }
}
