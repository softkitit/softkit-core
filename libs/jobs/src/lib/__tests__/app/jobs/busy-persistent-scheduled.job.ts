import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Jobs } from './vo/jobs.enum';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { BaseBusyPersistentJob } from './base-busy-persistent.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
@Processor(Jobs.BUSY_PERSISTENT_SCHEDULED_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyPersistentScheduledJob extends BaseBusyPersistentJob {
  constructor(
    @InjectQueue(Jobs.BUSY_PERSISTENT_SCHEDULED_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyPersistentScheduledJob.name)
    logger: PinoLogger,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, jobVersionService, jobExecutionService);
  }
}
