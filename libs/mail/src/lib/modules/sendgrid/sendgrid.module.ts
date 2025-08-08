import { DynamicModule, Module } from '@nestjs/common';
import { AbstractMailService, SendgridService } from '../../services';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { SENDGRID_CLIENT_TOKEN, SENDGRID_CONFIG_TOKEN } from '../../constants';
import { SendgridAsyncOptions, SendgridConfig } from '../../config';
import type { Client } from '@sendgrid/client';

@Module({})
export class SendgridMailModule {
  public static forRoot(
    sendgridConfig: SendgridConfig,
    global: boolean = true,
  ): DynamicModule {
    const mailProvider: Provider = {
      provide: SENDGRID_CONFIG_TOKEN,
      useValue: sendgridConfig,
    };

    const defaultProvidersAndExports = this.createDefaultProvidersAndExports();

    if (defaultProvidersAndExports.providers) {
      defaultProvidersAndExports.providers.push(mailProvider);
    }

    return {
      global,
      ...defaultProvidersAndExports,
    };
  }

  static forRootAsync(
    options: SendgridAsyncOptions,
    global: boolean = true,
  ): DynamicModule {
    const defaultProvidersAndExports = this.createDefaultProvidersAndExports();
    const asyncConfigProvider = this.createAsyncProvider(options);

    const providers = [
      asyncConfigProvider,
      ...(defaultProvidersAndExports.providers || []),
    ];

    return {
      global,
      module: SendgridMailModule,
      imports: options.imports || [],
      providers,
      exports: [...(defaultProvidersAndExports.exports || [])],
    };
  }

  private static createDefaultProvidersAndExports(): DynamicModule {
    return {
      module: SendgridMailModule,
      providers: [
        {
          provide: AbstractMailService,
          useClass: SendgridService,
        },
        {
          provide: SENDGRID_CLIENT_TOKEN,
          useFactory: async (authCredentials: SendgridConfig) => {
            // eslint-disable-next-line unicorn/no-await-expression-member
            const MailService = await import('@sendgrid/mail');

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const mailService = new MailService.MailService();
            const client = mailService['client'] as Client;

            mailService.setApiKey(authCredentials.apiKey);

            if (authCredentials.dataResidency) {
              client.setDataResidency(authCredentials.dataResidency);
            }

            return mailService;
          },
          inject: [SENDGRID_CONFIG_TOKEN],
        },
      ],
      exports: [AbstractMailService, SENDGRID_CLIENT_TOKEN],
    };
  }

  private static createAsyncProvider = (
    options: SendgridAsyncOptions,
  ): Provider => {
    return {
      provide: SENDGRID_CONFIG_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  };
}
