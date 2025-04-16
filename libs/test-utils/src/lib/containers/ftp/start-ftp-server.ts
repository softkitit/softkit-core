import { GenericContainer, Wait } from 'testcontainers';
import {
  DEFAULT_START_FTP_SERVER_OPTIONS,
  FTPUser,
  StartFTPServerOptions,
} from './start-ftp-server.options';
import { retrievePortFromBinding } from '../utils';
import { setFTPServerEnv } from './set-ftp-server-env-variables';
import { FTPServerStartedOptions } from './ftp-server-started.options';
import { StartedFTPOptions } from './started-ftp.options';

export async function startFTPServer(
  opts?: StartFTPServerOptions,
): Promise<StartedFTPOptions> {
  const options = {
    ...DEFAULT_START_FTP_SERVER_OPTIONS,
    ...opts,
  };

  if (
    options.maximumPortForPassiveConnections <
    options.minimumPortForPassiveConnections
  ) {
    throw new Error(
      `Maximum port is after minimum port, can't expose passive connections that is a recommended mode.`,
    );
  }

  const passivePortsCount =
    options.maximumPortForPassiveConnections -
    options.minimumPortForPassiveConnections;

  if (passivePortsCount > 100) {
    throw new Error(
      `Dedicating more than 100 ports for passive connection for local tests looks like a mistake`,
    );
  }

  // eslint-disable-next-line no-console
  console.time(`start ftp server`);

  let containerBuilder = new GenericContainer(
    `delfer/alpine-ftp-server:latest`,
  ).withExposedPorts(options.bindToPort);

  for (
    let i = options.minimumPortForPassiveConnections;
    i <= options.maximumPortForPassiveConnections;
    i++
  ) {
    containerBuilder = containerBuilder.withExposedPorts({
      container: i,
      host: i,
    });
  }

  const container = await containerBuilder
    .withStartupTimeout(50_000)
    .withEnvironment({
      USERS: mapUsersToEnvVariable(options.users),
      MIN_PORT: options.minimumPortForPassiveConnections + '',
      MAX_PORT: options.maximumPortForPassiveConnections + '',
    })
    .withWaitStrategy(Wait.forLogMessage('changed by root'))
    .start();

  // eslint-disable-next-line no-console
  console.timeEnd(`start ftp server`);

  const bindToPort = retrievePortFromBinding(container, options.bindToPort);

  const serverStartedConfig: FTPServerStartedOptions = {
    port: bindToPort,
    host: 'localhost',
  };

  await setFTPServerEnv(serverStartedConfig, options.users);

  return {
    container,
    serverStartedConfig,
    startOptions: options,
  };
}

const mapUsersToEnvVariable = (users: FTPUser[]): string => {
  return users
    .map((u) =>
      [u.name, u.password, u.folder, u.gid, u.uid].filter((v) => !!v).join('|'),
    )
    .join(' ');
};
