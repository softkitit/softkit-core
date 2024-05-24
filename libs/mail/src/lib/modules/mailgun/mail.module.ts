import { DynamicModule, Module } from '@nestjs/common';
import { AbstractMailService } from '../../services';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { MAILGUN_CLIENT_TOKEN, MAILGUN_CONFIG_TOKEN } from '../../constants';
import { MailgunService } from '../../services';
import { MailgunAsyncOptions, MailgunConfig } from '../../config';
import FormData from 'form-data';

@Module({})
export class MailgunMailModule {
  public static forRoot(
    mailConfig: MailgunConfig,
    global: boolean = true,
  ): DynamicModule {
    const mailProvider: Provider = {
      provide: MAILGUN_CONFIG_TOKEN,
      useValue: mailConfig,
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
    options: MailgunAsyncOptions,
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
      module: MailgunMailModule,
      imports: options.imports || [],
      providers,
      exports: [...(defaultProvidersAndExports.exports || [])],
    };
  }

  private static createDefaultProvidersAndExports(): DynamicModule {
    return {
      module: MailgunMailModule,
      providers: [
        {
          provide: AbstractMailService,
          useClass: MailgunService,
        },
        {
          provide: MAILGUN_CLIENT_TOKEN,
          useFactory: async (authCredentials: MailgunConfig) => {
            const Mailgun = await import('mailgun.js');
            return new Mailgun.default(FormData).client(authCredentials);
          },
          inject: [MAILGUN_CONFIG_TOKEN],
        },
      ],
      exports: [AbstractMailService, MAILGUN_CLIENT_TOKEN],
    };
  }

  private static createAsyncProvider = (
    options: MailgunAsyncOptions,
  ): Provider => {
    return {
      provide: MAILGUN_CONFIG_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  };
}
