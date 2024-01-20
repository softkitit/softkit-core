import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Jobs } from './vo/jobs.enum';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { BaseBusyPersistentJob } from './base-busy-persistent.job';

// @ts-ignore
@Processor(Jobs.BUSY_PERSISTENT_SCHEDULED_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class BusyPersistentScheduledJob extends BaseBusyPersistentJob {
  constructor(
    @InjectQueue(Jobs.BUSY_PERSISTENT_SCHEDULED_JOB) queue: Queue<BusyJobData>,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, jobVersionService, jobExecutionService);
  }
}
