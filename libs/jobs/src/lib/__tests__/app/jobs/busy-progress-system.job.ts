import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { Jobs } from './vo/jobs.enum';
import { BaseBusyProgressJob } from './base-busy-progress.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RedlockService } from '@anchan828/nest-redlock';

@Processor(Jobs.BUSY_PROGRESS_SYSTEM_JOB, {
  concurrency: 10,
  maxStalledCount: 10,
})
export class BusyProgressSystemJob extends BaseBusyProgressJob {
  protected override singleRunningJobGlobally = true;

  constructor(
    @InjectQueue(Jobs.BUSY_PROGRESS_SYSTEM_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyProgressSystemJob.name)
    logger: PinoLogger,
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }
}
