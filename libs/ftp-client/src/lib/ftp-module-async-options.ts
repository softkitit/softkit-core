import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { IFTPClientConfig } from './config/ftp-client-config.interface';

export const SOFTKIT_FTP_CLIENT_CONFIG_TOKEN = Symbol(
  'SOFTKIT_FTP_CLIENTS_CONFIG_TOKEN',
);
export const DEFAULT_INJECT_TOKEN = 'SOFTKIT_DEFAULT_FTP_CLIENT_TOKEN';

export interface FTPModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => IFTPClientConfig | Promise<IFTPClientConfig>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  providers?: Provider[];
}
