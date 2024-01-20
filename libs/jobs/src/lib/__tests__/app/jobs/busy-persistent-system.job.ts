import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { Jobs } from './vo/jobs.enum';
import { BaseBusyPersistentJob } from './base-busy-persistent.job';

// @ts-ignore
@Processor(Jobs.BUSY_PERSISTENT_SYSTEM_JOB, {
  concurrency: 1,
  maxStalledCount: 10,
})
export class BusyPersistentSystemJob extends BaseBusyPersistentJob {
  constructor(
    @InjectQueue(Jobs.BUSY_PERSISTENT_SYSTEM_JOB) queue: Queue<BusyJobData>,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, jobVersionService, jobExecutionService);
  }
}
