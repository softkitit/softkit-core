import { S3 } from '@aws-sdk/client-s3';

import { DynamicModule, Module } from '@nestjs/common';
import { S3_SERVICE_CONFIG_TOKEN, S3_CLIENT_TOKEN } from './constants';
import { AbstractFileService } from './services';
import { S3FileService } from './services';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { S3ClientConfig } from '@aws-sdk/client-s3/dist-types/S3Client';
import type { NodeJsClient } from '@smithy/types';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

export interface S3FileStorageConfigFactory {
  createS3ConfigOptions: () => S3ClientConfig | Promise<S3ClientConfig>;
}

export interface S3FileStorageAsyncParams {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => S3ClientConfig | Promise<S3ClientConfig>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  providers?: Provider[];
}

export const createAsyncOptions = async (
  optionsFactory: S3FileStorageConfigFactory,
): Promise<S3ClientConfig> => {
  return await optionsFactory.createS3ConfigOptions();
};

@Module({})
export class S3FileStorageModule {
  static forRootAsync(
    options: S3FileStorageAsyncParams,
    global: boolean = true,
  ): DynamicModule {
    const defaultProvidersAndExports = this.createDefaultProvidersAndExports();

    const asyncConfigProvider =
      S3FileStorageModule.createAsyncOptionsProvider(options);

    if (defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers.push(asyncConfigProvider);
    }

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  static forRoot(
    s3Config: S3ClientConfig,
    global: boolean = true,
  ): DynamicModule {
    const s3ConfigProvider: Provider = {
      provide: S3_SERVICE_CONFIG_TOKEN,
      useValue: s3Config,
    };

    const defaultProvidersAndExports = this.createDefaultProvidersAndExports();

    if (defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers.push(s3ConfigProvider);
    }

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  private static createDefaultProvidersAndExports(): DynamicModule {
    return {
      module: S3FileStorageModule,
      providers: [
        {
          provide: AbstractFileService,
          useClass: S3FileService,
        },
        {
          useExisting: AbstractFileService,
          provide: S3FileService,
        },
        {
          provide: S3_CLIENT_TOKEN,
          useFactory: (config: S3ClientConfig) => {
            let credentials = config?.credentials;

            if (!credentials) {
              credentials = defaultProvider();
            }
            return new S3({
              ...config,
              credentials,
            }) as NodeJsClient<S3>;
          },
          inject: [S3_SERVICE_CONFIG_TOKEN],
        },
      ],
      exports: [AbstractFileService, S3FileService, S3_CLIENT_TOKEN],
    };
  }

  private static createAsyncOptionsProvider = (
    options: S3FileStorageAsyncParams,
  ): Provider => {
    return {
      provide: S3_SERVICE_CONFIG_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  };
}
