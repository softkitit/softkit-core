import { DynamicModule, Logger, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import { JobsConfig } from './config';
import { JOBS_CONFIG_TOKEN } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  JobInitializationService,
  JobDefinitionService,
  SchedulingJobService,
  AbstractSchedulingJobService,
  AbstractJobDefinitionService,
  AbstractJobExecutionService,
  JobExecutionService,
  AbstractJobVersionService,
  JobVersionService,
} from './service';
import { JobDefinition, JobExecution, JobVersion } from './entity';
import * as Repositories from './repository';
import { BullModule } from '@nestjs/bullmq';
import { RegisterQueueOptions } from '@nestjs/bullmq/dist/interfaces/register-queue-options.interface';
import { setupRedisLockModule, setupRedisModule } from '@softkit/redis';

type JobsConfigOrPromise = JobsConfig | Promise<JobsConfig>;

export interface JobsAsyncParams {
  queueNames: string[];
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => JobsConfigOrPromise;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  providers?: Provider[];
}

@Module({})
export class JobsModule {
  static logger: Logger = new Logger(JobsModule.name);

  static forRootAsync(
    options: JobsAsyncParams,
    global: boolean = true,
  ): DynamicModule {
    const defaultProvidersAndExports = this.createDefaultProvidersAndExports(
      options.queueNames,
    );

    const asyncConfigProvider = JobsModule.createAsyncOptionsProvider(options);

    if (defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers.push(asyncConfigProvider);
    }

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  static forRoot(
    config: JobsConfig,
    queueNames: string[],
    global: boolean = true,
  ): DynamicModule {
    const jobsConfigProvider: Provider = {
      provide: JOBS_CONFIG_TOKEN,
      useValue: config,
    };

    const defaultProvidersAndExports =
      this.createDefaultProvidersAndExports(queueNames);

    if (defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers.push(jobsConfigProvider);
    }

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  private static createDefaultProvidersAndExports(
    queueNames: string[],
  ): DynamicModule {
    const sanitizedQueueNames = this.validateAndSanitizeQueueNames(queueNames);

    const registerQueuesModules = this.registerQueues(sanitizedQueueNames);
    const bullModule = this.setupBullModule();
    const redisModule = setupRedisModule();
    const lockModule = setupRedisLockModule();

    return {
      module: JobsModule,
      imports: [
        lockModule,
        redisModule,
        ...registerQueuesModules,
        bullModule,
        TypeOrmModule.forFeature([JobDefinition, JobExecution, JobVersion]),
      ],
      providers: [
        JobInitializationService,
        {
          provide: AbstractJobDefinitionService,
          useClass: JobDefinitionService,
        },
        {
          provide: AbstractJobExecutionService,
          useClass: JobExecutionService,
        },
        {
          provide: AbstractJobDefinitionService,
          useClass: JobDefinitionService,
        },
        {
          provide: AbstractJobVersionService,
          useClass: JobVersionService,
        },
        {
          provide: AbstractSchedulingJobService,
          useClass: SchedulingJobService,
        },
        ...Object.values(Repositories),
      ],
      exports: [
        redisModule,
        lockModule,
        bullModule,
        ...registerQueuesModules,
        JOBS_CONFIG_TOKEN,
        AbstractSchedulingJobService,
        AbstractJobVersionService,
        AbstractJobDefinitionService,
        AbstractJobExecutionService,
      ],
    };
  }

  private static setupBullModule() {
    return BullModule.forRootAsync({
      useFactory: (jobsConfig: JobsConfig) => {
        const { redisConfig, ...bullConfig } = jobsConfig;
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          commandTimeout: _,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          maxRetriesPerRequest: __,
          ...redisConfigWithoutTimeout
        } = redisConfig.config[0];
        return {
          // we are picking up the first connection from the config, because bull do support only one connection
          connection: {
            ...redisConfigWithoutTimeout,
          },
          ...bullConfig,
        };
      },
      inject: [JOBS_CONFIG_TOKEN],
    });
  }

  private static registerQueues(sanitizedQueueNames: string[]) {
    return sanitizedQueueNames.map((queueName) => {
      return BullModule.registerQueueAsync({
        name: queueName,
        useFactory: (config: JobsConfig) => {
          const allJobs = [
            ...(config.jobs || []),
            ...(config.systemJobs?.jobs || []),
          ];

          const allQueuesConfigs = new Set(
            allJobs.map((value) => {
              return value.name;
            }),
          );

          const allPresent = sanitizedQueueNames.every((q) => {
            return allQueuesConfigs.has(q);
          });

          if (!allPresent) {
            const message = `Not all provided queues are presented in a config, that should not happen.
                  Config queues: ${[
                    ...allQueuesConfigs,
                  ]}, provided list to a method: ${sanitizedQueueNames}`;
            this.logger.log(message);
            throw new Error(message);
          }

          if (sanitizedQueueNames.length !== allQueuesConfigs.size) {
            const missingQueues = [...allQueuesConfigs].filter(
              (q) => !sanitizedQueueNames.includes(q),
            );

            const message = `There are more jobs in a config, than provided to a method.
             Missing queues: ${missingQueues}. Please add them to initial list of queues or remove it from the config`;
            JobsModule.logger.log(message);
            throw new Error(message);
          }
          const jobConfig = allJobs?.find((j) => {
            return j.name === queueName;
          });

          if (!jobConfig) {
            const allQueuesConfigs = allJobs.map((value) => {
              return value.name;
            });

            const message = `There is a missing config for the queue: ${queueName}, there are configurations available for queues: ${allQueuesConfigs}, it may be a typo or just missing config, check it please`;
            JobsModule.logger.log(message);
            throw new Error(message);
          }

          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            commandTimeout: _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            enableOfflineQueue: __,
            ...redisConnection
          } = config.redisConfig.config[0];

          return {
            name: jobConfig.name,
            // defaultJobOptions: jobConfig.defaultJobOptions,
            // connection should be provided each time to prevent redis to hang up with one connection
            connection: {
              enableOfflineQueue: false,
              ...redisConnection,
            },
          } satisfies RegisterQueueOptions;
        },
        inject: [JOBS_CONFIG_TOKEN],
      });
    });
  }

  private static createAsyncOptionsProvider = (
    options: JobsAsyncParams,
  ): Provider => {
    return {
      provide: JOBS_CONFIG_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  };

  private static validateAndSanitizeQueueNames = (queueNames: string[]) => {
    const sanitizedQueues = [
      ...new Set(
        queueNames.filter((q) => q !== '' && q !== undefined && q !== null),
      ),
    ];

    if (
      sanitizedQueues.length !== queueNames.length ||
      sanitizedQueues.length === 0
    ) {
      const message = `You provided an empty queue name in a list or the list is empty, or a duplicate appear. Original list: ${queueNames}, sanitized list: ${sanitizedQueues}`;
      JobsModule.logger.log(message);
      throw new Error(message);
    }

    return sanitizedQueues;
  };
}
