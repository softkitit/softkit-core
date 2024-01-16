import { Module } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';
import { JobsConfig } from '../../config';
import { FakeJob } from './jobs/fake.job';
import { setupTypeormModule } from '@softkit/typeorm';
import { JobsModule } from '../../jobs.module';
import { Jobs } from './jobs/vo/jobs.enum';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, JobExecution } from '../../entity';
import { FakeSystemJob } from './jobs/fake-system.job';

@Module({
  controllers: [],
  providers: [FakeJob, FakeSystemJob],
  exports: [],
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    setupTypeormModule(),
    TypeOrmModule.forFeature([Job, JobExecution]),
    JobsModule.forRootAsync({
      queueNames: Object.values(Jobs),
      useFactory: (j) => j,
      inject: [JobsConfig],
    }),
  ],
})
export class AppModule {}
