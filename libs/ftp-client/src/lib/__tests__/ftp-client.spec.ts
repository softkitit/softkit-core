import { StartedFTPOptions, startFTPServer } from '@softkit/test-utils';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_INJECT_TOKEN } from '../ftp-module-async-options';
import { Client } from 'basic-ftp';
import {
  CUSTOM_TOKEN_FTP_CLIENT_CONFIG_TOKEN,
  NO_AUTO_CONNECT_FTP_CLIENT_CONFIG_TOKEN,
} from './app/custom-tokens';
import { RootConfig } from './app/config/root.config';

describe('ftp client in app tests', () => {
  let ftpServer: StartedFTPOptions;
  let testingModule: TestingModule;

  beforeAll(async () => {
    ftpServer = await startFTPServer();
  }, 60_000);

  afterAll(async () => {
    if (ftpServer) await ftpServer.container.stop();
  });

  beforeEach(async () => {
    const { FtpClientTestAppModule } = require('./app/ftp-client-test.module');
    testingModule = await Test.createTestingModule({
      imports: [FtpClientTestAppModule],
    }).compile();
  });

  it('should expose and connect with default settings', async () => {
    const clientByDefaultInjectToken =
      testingModule.get<Client>(DEFAULT_INJECT_TOKEN);

    const defaultClientByClass = testingModule.get<Client>(Client);

    expect(clientByDefaultInjectToken).toBe(defaultClientByClass);

    const resultFiles = await defaultClientByClass.list('');

    expect(resultFiles.length).toBe(0);
  });

  it('should get client by custom token', async () => {
    const clientByCustomToken = testingModule.get<Client>(
      CUSTOM_TOKEN_FTP_CLIENT_CONFIG_TOKEN,
    );

    const resultFiles = await clientByCustomToken.list('');

    expect(resultFiles.length).toBe(0);
  });

  it('should get client without auto connect by custom token', async () => {
    const clientByCustomTokenWithNoAutoConnect = testingModule.get<Client>(
      NO_AUTO_CONNECT_FTP_CLIENT_CONFIG_TOKEN,
    );

    await expect(
      clientByCustomTokenWithNoAutoConnect.list(),
    ).rejects.toBeDefined();

    const config = testingModule.get<RootConfig>(RootConfig);

    await expect(
      clientByCustomTokenWithNoAutoConnect.access(
        config.noAutoConnectFTPClientConfig,
      ),
    ).resolves.toBeDefined();

    const arr = await clientByCustomTokenWithNoAutoConnect.list();
    expect(arr.length).toBe(0);
  });
});
