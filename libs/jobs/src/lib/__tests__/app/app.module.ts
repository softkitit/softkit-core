import { Module } from '@nestjs/common';
import { JobsConfig } from '../../config';
import { setupTypeormModule } from '@softkit/typeorm';
import { JobsModule } from '../../jobs.module';
import { Jobs } from './jobs/vo/jobs.enum';
import { setupLoggerModule } from '@softkit/logger';
import { BusyProgressSystemJob } from './jobs/busy-progress-system.job';
import { BusyJob } from './jobs/busy.job';
import { BusyProgressScheduledJob } from './jobs/busy-progress-scheduled.job';
import { AlwaysFailingJob } from './jobs/always-failing.job';
import { AlwaysFailingProgressJob } from './jobs/always-failing-progress.job';
import { BusyNotScheduledJob } from './jobs/busy-not-scheduled.job';
import { BusyNotScheduledProgressJob } from './jobs/busy-not-scheduled-progress.job';
import { BusyNotLockableJob } from './jobs/busy-not-lockable.job';

@Module({
  controllers: [],
  providers: [
    BusyJob,
    BusyProgressScheduledJob,
    BusyProgressSystemJob,
    AlwaysFailingJob,
    AlwaysFailingProgressJob,
    BusyNotScheduledJob,
    BusyNotScheduledProgressJob,
    BusyNotLockableJob,
  ],
  exports: [],
  imports: [
    setupLoggerModule(),
    setupTypeormModule(),
    JobsModule.forRootAsync({
      queueNames: Object.values(Jobs),
      useFactory: (j) => j,
      inject: [JobsConfig],
    }),
  ],
})
export class AppModule {}
