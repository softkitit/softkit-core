import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { SendgridConfig } from './sendgrid.config';

export interface SendgridAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => SendgridConfig | Promise<SendgridConfig>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  providers?: Provider[];
}
