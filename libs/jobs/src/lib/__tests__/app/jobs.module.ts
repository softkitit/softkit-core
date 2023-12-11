import { Module } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';
import { BullModule } from '@nestjs/bullmq';
import { JobsConfig } from '../../config/jobs.config';
import { FakeJob } from './jobs/fake.job';

@Module({
  controllers: [],
  providers: [FakeJob],
  exports: [],
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    BullModule.registerQueueAsync({
      name: 'fake-job-queue',
    }),
    BullModule.forRootAsync({
      useFactory: (jobsConfig: JobsConfig) => jobsConfig,
      inject: [JobsConfig],
    }),
  ],
})
export class JobsModule {}
