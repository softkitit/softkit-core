import { Module } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';
import { JobsConfig } from '../../config';
import { BusyJob } from './jobs/busy.job';
import { setupTypeormModule } from '@softkit/typeorm';
import { JobsModule } from '../../jobs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobDefinition, JobExecution, JobVersion } from '../../entity';
import { BusyPersistentSystemJob } from './jobs/busy-persistent-system.job';
import { Jobs } from './jobs/vo/jobs.enum';
import { setupLoggerModule } from '@softkit/logger';

@Module({
  controllers: [],
  providers: [BusyJob, BusyPersistentSystemJob],
  exports: [],
  imports: [
    setupLoggerModule(),
    setupYamlBaseConfigModule(__dirname, RootConfig),
    setupTypeormModule(),
    TypeOrmModule.forFeature([JobDefinition, JobExecution, JobVersion]),
    JobsModule.forRootAsync({
      queueNames: Object.values(Jobs),
      useFactory: (j) => j,
      inject: [JobsConfig],
    }),
  ],
})
export class AppModule {}
