import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Jobs } from './vo/jobs.enum';
import { BusyJobData } from './vo/busy-job-data.dto';
import { JobProcessor } from '../../../job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// @ts-ignore
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
  ) {
    super(queue, logger);
  }

  protected override run(): Promise<unknown> {
    this.jobStats.executed++;
    throw new Error('AlwaysFailingJob');
  }
}
