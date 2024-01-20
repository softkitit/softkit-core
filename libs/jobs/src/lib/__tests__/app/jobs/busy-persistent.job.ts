import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { BaseBusyPersistentJob } from './base-busy-persistent.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
@Processor(Jobs.BUSY_PERSISTENT_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyPersistentJob extends BaseBusyPersistentJob {
  constructor(
    @InjectQueue(Jobs.BUSY_PERSISTENT_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(BusyPersistentJob.name)
    logger: PinoLogger,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, jobVersionService, jobExecutionService);
  }
}
