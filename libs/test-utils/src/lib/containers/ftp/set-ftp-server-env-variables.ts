import { FTPServerStartedOptions } from './ftp-server-started.options';
import { FTPUser } from './start-ftp-server.options';

export async function setFTPServerEnv(
  startedConfig: FTPServerStartedOptions,
  users: FTPUser[],
) {
  process.env['TEST_FTP_SERVER_PORT'] = startedConfig.port + '';
  process.env['TEST_FTP_SERVER_HOST'] = startedConfig.host;

  for (const [i, userDetails] of users.entries()) {
    const envPostfix = i === 0 ? '' : i + '';

    process.env[
      ['TEST_FTP_SERVER_USERNAME', envPostfix].filter((v) => !!v).join('_')
    ] = userDetails.name;

    process.env[
      ['TEST_FTP_SERVER_PASSWORD', envPostfix].filter((v) => !!v).join('_')
    ] = userDetails.password;
  }
}
