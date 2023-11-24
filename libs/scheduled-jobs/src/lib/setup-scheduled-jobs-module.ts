import { DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduledJobsConfig } from './config/scheduled-jobs.config';

export function setupScheduledJobsModule(): DynamicModule[] {
  return [
    BullModule.forRootAsync({
      useFactory: () => ({
        defaultJobOptions: {
          removeOnComplete: 1000,
        },
      }),
      inject: [ScheduledJobsConfig],
    }),
  ];
}
