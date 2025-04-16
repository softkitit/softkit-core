import type { AccessOptions } from 'basic-ftp';

export interface IFTPClientConfig extends AccessOptions {
  timeout?: number;
  connectOnStartup?: boolean;
}
