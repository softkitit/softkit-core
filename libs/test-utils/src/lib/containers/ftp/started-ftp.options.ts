import { StartedTestContainer } from 'testcontainers/build/test-container';
import { FTPServerStartedOptions } from './ftp-server-started.options';
import { StartFTPServerOptions } from './start-ftp-server.options';

export interface StartedFTPOptions {
  container: StartedTestContainer;
  serverStartedConfig: FTPServerStartedOptions;
  startOptions: Required<StartFTPServerOptions>;
}
