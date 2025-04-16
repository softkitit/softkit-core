import { DynamicModule, ExistingProvider, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { IFTPClientConfig } from './config/ftp-client-config.interface';
import {
  DEFAULT_INJECT_TOKEN,
  FTPModuleAsyncOptions,
  SOFTKIT_FTP_CLIENT_CONFIG_TOKEN,
} from './ftp-module-async-options';
import { Client } from 'basic-ftp';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

@Module({})
export class FtpClientModule {
  public static forRoot(
    config: IFTPClientConfig,
    global: boolean = true,
    customInjectToken?: InjectionToken,
  ): DynamicModule {
    const ftpClientsConfigProvider: Provider = {
      provide: SOFTKIT_FTP_CLIENT_CONFIG_TOKEN,
      useValue: config,
    };

    const defaultProvidersAndExports =
      this.createDefaultProvidersAndExports(customInjectToken);

    if (!defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers = [];
    }

    defaultProvidersAndExports.providers.push(ftpClientsConfigProvider);

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  static forRootAsync(
    options: FTPModuleAsyncOptions,
    global: boolean = true,
    customInjectToken?: InjectionToken,
  ): DynamicModule {
    const defaultProvidersAndExports =
      this.createDefaultProvidersAndExports(customInjectToken);
    const asyncConfigProvider = this.createAsyncProvider(options);

    const providers = [
      asyncConfigProvider,
      ...(defaultProvidersAndExports.providers || []),
    ];

    return {
      global,
      module: FtpClientModule,
      imports: options.imports || [],
      providers,
      exports: [...(defaultProvidersAndExports.exports || [])],
    };
  }

  private static createDefaultProvidersAndExports(
    customTokenForClient: InjectionToken = DEFAULT_INJECT_TOKEN,
  ): DynamicModule {
    const isDefaultToken = customTokenForClient === DEFAULT_INJECT_TOKEN;
    const aliasProvider: Provider | undefined = isDefaultToken
      ? ({
          provide: Client,
          useExisting: customTokenForClient,
        } satisfies ExistingProvider)
      : undefined;

    const providers: Provider[] = [
      {
        provide: customTokenForClient,
        useFactory: async (config: IFTPClientConfig) => {
          const client = new Client(config.timeout);

          if (config.connectOnStartup) {
            await client.access(config);
          }

          return client;
        },
        inject: [SOFTKIT_FTP_CLIENT_CONFIG_TOKEN],
      },
    ];

    if (aliasProvider) {
      providers.push(aliasProvider);
    }

    const exports: Array<
      | string
      | symbol
      // eslint-disable-next-line @typescript-eslint/ban-types
      | Function
    > = [customTokenForClient];

    if (aliasProvider) {
      exports.push(Client);
    }

    return {
      module: FtpClientModule,
      providers,
      exports,
    };
  }

  private static createAsyncProvider = (
    options: FTPModuleAsyncOptions,
  ): Provider => {
    return {
      provide: SOFTKIT_FTP_CLIENT_CONFIG_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  };
}
