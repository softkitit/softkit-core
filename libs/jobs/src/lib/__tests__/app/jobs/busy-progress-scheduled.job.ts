import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Jobs } from './vo/jobs.enum';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { BaseBusyProgressJob } from './base-busy-progress.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RedlockService } from '@anchan828/nest-redlock';

@Processor(Jobs.BUSY_PROGRESS_SCHEDULED_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyProgressScheduledJob extends BaseBusyProgressJob {
  constructor(
    @InjectQueue(Jobs.BUSY_PROGRESS_SCHEDULED_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyProgressScheduledJob.name)
    logger: PinoLogger,
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }
}
