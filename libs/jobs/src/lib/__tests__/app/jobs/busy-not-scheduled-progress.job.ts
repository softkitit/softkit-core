import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { BaseBusyProgressJob } from './base-busy-progress.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@Processor(Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyNotScheduledProgressJob extends BaseBusyProgressJob {
  constructor(
    @InjectQueue(Jobs.BUSY_NOT_SCHEDULED_PROGRESS_JOB)
    queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyNotScheduledProgressJob.name)
    logger: PinoLogger,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, jobVersionService, jobExecutionService);
  }
}
