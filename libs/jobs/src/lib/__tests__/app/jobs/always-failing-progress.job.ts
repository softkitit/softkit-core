import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Jobs } from './vo/jobs.enum';
import { Queue } from 'bullmq';
import { BusyJobData } from './vo/busy-job-data.dto';
import {
  AbstractJobExecutionService,
  AbstractJobVersionService,
} from '../../../service';
import { JobProcessor } from '../../../job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RedlockService } from '@anchan828/nest-redlock';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@Processor(Jobs.ALWAYS_FAILING_PROGRESS_JOB, {
  concurrency: 50,
  maxStalledCount: 10,
})
export class AlwaysFailingProgressJob extends JobProcessor<BusyJobData> {
  override singleRunningJobGlobally = true;

  public jobStats = {
    executed: 0,
  };

  constructor(
    @InjectQueue(Jobs.ALWAYS_FAILING_PROGRESS_JOB) queue: Queue<BusyJobData>,
    @InjectPinoLogger(AlwaysFailingProgressJob.name)
    logger: PinoLogger,
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }

  protected override run(): Promise<unknown> {
    this.jobStats.executed++;
    throw new Error('Failing intentionally.');
  }
}
