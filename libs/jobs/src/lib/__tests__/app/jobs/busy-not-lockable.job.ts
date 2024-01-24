import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BaseBusyJob } from './base-busy.job';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { RedlockService } from '@anchan828/nest-redlock';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }
}
