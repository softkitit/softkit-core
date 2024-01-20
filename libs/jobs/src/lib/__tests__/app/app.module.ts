import { Module } from '@nestjs/common';
import { JobsConfig } from '../../config';
import { BusyJob } from './jobs/busy.job';
import { setupTypeormModule } from '@softkit/typeorm';
import { JobsModule } from '../../jobs.module';
import { BusyPersistentSystemJob } from './jobs/busy-persistent-system.job';
import { Jobs } from './jobs/vo/jobs.enum';
import { setupLoggerModule } from '@softkit/logger';
import { BusyPersistentScheduledJob } from './jobs/busy-persistent-scheduled.job';

@Module({
  controllers: [],
  providers: [BusyJob, BusyPersistentScheduledJob, BusyPersistentSystemJob],
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
