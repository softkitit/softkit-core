import { DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsConfig } from './config/jobs.config';

export function setupJobsModule(): DynamicModule[] {
  return [
    BullModule.forRootAsync({
      useFactory: () => ({
        defaultJobOptions: {
          removeOnComplete: 1000,
        },
      }),
      inject: [JobsConfig],
    }),
  ];
}
