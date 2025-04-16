import { startFTPServer } from '../lib/containers/ftp/start-ftp-server';
import { Client } from 'basic-ftp';
import { faker } from '@faker-js/faker';
import { Readable, Writable } from 'node:stream';
import { StartedFTPOptions } from '../lib/containers/ftp/started-ftp.options';

describe('start ftp server and create configs', () => {
  it('do not allow maximum port to be less then minimum', async () => {
    await expect(
      startFTPServer({
        maximumPortForPassiveConnections: 19_999,
        minimumPortForPassiveConnections: 20_000,
      }),
    ).rejects.toBeDefined();
  });

  it('do not allow for port range to be too big', async () => {
    await expect(
      startFTPServer({
        maximumPortForPassiveConnections: 20_500,
        minimumPortForPassiveConnections: 20_000,
      }),
    ).rejects.toBeDefined();
  });

  it('start ftp server with multiple users', async () => {
    let startedFTPOptions: StartedFTPOptions | undefined;
    try {
      startedFTPOptions = await startFTPServer({
        users: [
          {
            name: 'testusername',
            password: 'testuserpaswword',
          },
          {
            name: 'testusername1',
            password: 'testuserpaswword2',
          },
        ],
      });

      expect(startedFTPOptions.startOptions.users.length).toBe(2);
    } finally {
      await startedFTPOptions?.container.stop();
    }
  });

  it('check ftp starting, available and stopping', async () => {
    const { startOptions, serverStartedConfig, container } =
      await startFTPServer();

    try {
      expect(serverStartedConfig.port).toBeDefined();
      expect(serverStartedConfig.host).toBeDefined();
      expect(startOptions.users.length).toBe(1);

      const ftpClient = new Client();

      const ftpUser = startOptions.users[0];
      await ftpClient.access({
        host: serverStartedConfig.host,
        port: serverStartedConfig.port,
        user: ftpUser.name,
        secure: false,
        password: ftpUser.password,
      });

      const files = await ftpClient.list();
      expect(files.length).toBe(0);

      const fileText = faker.string.alphanumeric(100_000);
      const fileTextReadable = Readable.from(fileText);
      const fileName = 'test.txt';

      const readResponse = await ftpClient.uploadFrom(
        fileTextReadable,
        fileName,
      );
      expect(readResponse).toBeDefined();

      let downloadedData: string = '';

      const writable = new Writable({
        write(chunk, encoding, callback) {
          downloadedData = (downloadedData || '') + chunk;
          callback();
        },
      });

      const downloadResponse = await ftpClient.downloadTo(writable, 'test.txt');

      expect(downloadResponse).toBeDefined();
      expect(downloadedData).toBe(fileText);

      expect(container).toBeDefined();
    } finally {
      const stoppedTestContainer = await container.stop();
      expect(stoppedTestContainer).toBeDefined();
    }
  }, 60_000);
});
