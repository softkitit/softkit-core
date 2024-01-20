import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Jobs } from './vo/jobs.enum';
import { Job, Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { PersistentJobProcessor } from '../../../job';
import { BaseJobVersion } from '../../../entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
@Processor(Jobs.ALWAYS_FAILING_PERSISTENT_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class AlwaysFailingPersistentJob extends PersistentJobProcessor<BusyJobData> {
  public jobStats = {
    executed: 0,
  };
  constructor(
    @InjectQueue(Jobs.ALWAYS_FAILING_PERSISTENT_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(AlwaysFailingPersistentJob.name)
    logger: PinoLogger,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, jobVersionService, jobExecutionService);
  }

  protected override runWithTracking(
    job: Job<BusyJobData>,
    jobVersion: BaseJobVersion,
    token?: string,
  ): Promise<unknown> {
    this.jobStats.executed++;
    throw new Error('Method not implemented.');
  }
}
