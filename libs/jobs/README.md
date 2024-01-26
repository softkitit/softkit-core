# Jobs Module for NestJS

This library is a wrapper around bullmq library, and it provides a simple way to create jobs and workers, as well as persisting everything, and providing a simple interface to get jobs

We do support 3 types of jobs:

1. **System Jobs:**
  - These are tasks scheduled on application startup and typically run sequentially.
  - Examples include:
    - Sending reminder emails about payment.
    - Scheduling entity creations.
    - Performing housekeeping tasks like cleaning up old data.

2. **Scheduled User Jobs:**
  - Jobs scheduled by users, usually running one at a time per tenant/user.
  - Examples include:
    - Synchronizing API integrations.
    - Generating scheduled reports or data exports for data warehousing.

3. **One-Time Jobs for Users:**
  - Jobs scheduled by users to run one at a time, often as a single occurrence.
  - Examples include:
    - Initiating data export by clicking a button from the frontend or API.
    - Importing bulk data into the system.


## Features

- Automatically persisting jobs and workers to the database. Tracking job start, skip, progress, finish and fails. 
- Providing a default configuration to work with long-running jobs, and handle them properly 
- Added a mechanism to handle jobs that shouldn't be executed twice in the same time, by leveraging redlock algorithm
- Auto-schedule job system jobs on application startup
- Simple job configuration through yaml files, using config library with built-in validation on module initialization
- Job versioning to handle job changes properly and prevent new code to run on old job data 
- CRUD services to get jobs, job versions and job executions for each job version
- Ability to run now a scheduled job
- Advanced logger configuration, that populate a logger context with essential job information like id and name, and this data will be pushed to the log system, where the easy search will be available for debugging and monitoring purposes  
- Controller to get job information, scheduling job (TODO)


## Installation

```bash
yarn add @softkit/jobs @nestjs/bullmq @anchan828/nest-redlock bullmq
```

## Setup

### Add default configuration in your root config class

```typescript
import { JobsConfig } from '@softkit/jobs';

export class RootConfig {
  @ValidateNested()
  @Type(() => JobsConfig)
  jobsConfig!: JobsConfig;
}
```

### .env.yaml file

```yaml
jobsConfig:
  prefix: my-app
  jobs:
    #   that's place where you can define your user jobs
    - name: some-user-job
  #   that's where you can define your system jobs, they will be automatically scheduled on application startup
  systemJobs:
    jobs:
      - name: some-system-job
        repeat:
          pattern: '*/1 * * * * *'
        #          need to increment when data or config like pattern changed
        jobVersion: 1
        #        jobData - may be empty if you don't need to configure anything externally
        jobData:
          executeForMillis: 4000
  redisConfig:
    config:
      - connectionName: ${jobsConfig.prefix}-my-app
        host: ${REDIS_HOST:-localhost}
        port: ${REDIS_PORT:-6379}
        enableOfflineQueue: true
```
### .env-test.yaml file

```yaml
jobsConfig:
  redisConfig:
    config:
        host: ${TEST_REDIS_HOST}
        port: ${TEST_REDIS_PORT}
```

### Add library entities to your index.ts export that has all entity, `index.ts` file

```typescript
export { JobDefinition, JobExecution, JobVersion } from '@softkit/jobs';
```

### Generate migration for jobs entities


### Create Jobs enum (jobs.enum.ts) that will hold your jobs names, because of the limitation of how bullmq build, we can't hold everything in config, names must align

> [!NOTE]  
> During the runtime the application will check if all jobs are defined in the enum and in configuration, and throw an error if not

```typescript
export enum Jobs {
  BUSY_JOB = 'busy-job', // add your first job here that you want to add to the system
}
```


### Create jobs folder, add index.ts file to it and class (busy-job.job.ts - replace busy-job with your job name), also create a vo folder under jobs and add job-data.vo.ts file in case if you have a custom data for you job, each job must have at a least a job version in it, you can use VersionedJobData  

`busy-job.job.ts` file

```typescript
@Processor(Jobs.BUSY_JOB, {
  // if it's a system job, usually concurrency 1 is expected
  // if it's a user job, you need to think how many jobs by this time your application will be able to handle on production
  // concurrency is a number of jobs that can be executed in parallel on one node instance
  concurrency: 1,
})
export class BusyJob extends JobProcessor<BusyJobData> {
  constructor(
    // bullmq queue
    @InjectQueue(Jobs.BUSY_JOB) queue: Queue<BusyJobData>,
    // context aware logger 
    @InjectPinoLogger(BusyJob.name)
    logger: PinoLogger,
    // built in services, we just need to inject them to the job processor 
    lockService: RedlockService,
    jobVersionService: AbstractJobVersionService,
    jobExecutionService: AbstractJobExecutionService,
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }

  override async run(job: Job<BusyJobData>): Promise<void> {
    // todo implement you job logic here 
  }
}
```

### Add jobs module 

```typescript
import { Module } from '@nestjs/common';
import { JobsModule, JobsConfig } from '@softkit/jobs';
import * as Jobs from './jobs';

@Module({
  controllers: [],
  providers: [
    ...Object.values(Jobs),
  ],
  exports: [],
  imports: [
    JobsModule.forRootAsync({
      queueNames: Object.values(Jobs),
      useFactory: (j) => j,
      inject: [JobsConfig],
    }),
  ],
})
export class AppModule {}

```

### Start application, if you added a system job, it must be added to the database, to job_definition and job_version table respectively


## Work with system jobs

#### override `singleRunningJobGlobally` in your JobProcessor

it usually makes sense to turn on single global job option for system jobs, because they are usually running sequentially, and you don't want to have multiple instances of the same job running at the same time

```typescript
@Processor(Jobs.BUSY_JOB, {
  concurrency: 1,
})
export class BusyJob extends JobProcessor<BusyJobData> {
  override singleRunningJobGlobally = true;

  constructor(
    ...
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }
}
```

#### Changing data or options (cron pattern, or any other options)

> [!NOTE]
> If you change data or options of a job, you need to increment job version in application yaml, and it will be automatically scheduled on application startup
> Without doing it, the job won't be rescheduled, and you will have inconsistent data in config and db, that is not great


#### Configure minimal supported version for your job 

In some cases you will want to reschedule a job with a new version, but you don't want to run it on old data, because it will fail, and you will have a lot of failed jobs in your system, and it's not great, so you can configure minimal supported version for your job, and it will be automatically rescheduled with a new version, and old data will be skipped

```typescript
@Processor(Jobs.BUSY_JOB, {
  concurrency: 1,
})
export class BusyJob extends JobProcessor<BusyJobData> {
  override minimalSupportedVersion: number = 10;

  constructor(
    ...
  ) {
    super(queue, logger, lockService, jobVersionService, jobExecutionService);
  }
}
```

### Available services

1. AbstractJobDefinitionService - service to work with job definitions (every time when you add a new job, a new job definition created)
2. AbstractJobExecutionService - service to work with job executions (every time when you run a job, a new job execution create for the appropriate job version)
3. AbstractJobVersionService - service to work with job versions (every time when you reschedule a job, a new job version created)
4. AbstractSchedulingJobService - service to work with scheduling jobs (you can run a schedule job now, or schedule a system job by yourself)


## Work with user jobs

[//]: # (TODO implement)
