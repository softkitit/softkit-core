import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import { JobProcessor } from '../../../job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { RedlockService } from '@anchan828/nest-redlock';

@Processor(Jobs.ALWAYS_FAILING_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class AlwaysFailingJob extends JobProcessor<BusyJobData> {
  public jobStats = {
    executed: 0,
  };

  constructor(
    @InjectQueue(Jobs.ALWAYS_FAILING_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(AlwaysFailingJob.name)
    logger: PinoLogger,
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }

  protected override run(): Promise<unknown> {
    this.jobStats.executed++;
    throw new Error('AlwaysFailingJob');
  }
}
