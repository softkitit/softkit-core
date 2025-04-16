import { Module } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';
import { FtpClientModule } from '../../ftp-client.module';
import {
  CUSTOM_TOKEN_FTP_CLIENT_CONFIG_TOKEN,
  NO_AUTO_CONNECT_FTP_CLIENT_CONFIG_TOKEN,
} from './custom-tokens';

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    FtpClientModule.forRootAsync({
      useFactory: (rootConfig: RootConfig) => {
        return rootConfig.defaultFTPClientConfig;
      },
      inject: [RootConfig],
    }),
    FtpClientModule.forRootAsync(
      {
        useFactory: (rootConfig: RootConfig) => {
          return rootConfig.customTokenFTPClientConfig;
        },
        inject: [RootConfig],
      },
      true,
      CUSTOM_TOKEN_FTP_CLIENT_CONFIG_TOKEN,
    ),
    FtpClientModule.forRootAsync(
      {
        useFactory: (rootConfig: RootConfig) => {
          return rootConfig.noAutoConnectFTPClientConfig;
        },
        inject: [RootConfig],
      },
      true,
      NO_AUTO_CONNECT_FTP_CLIENT_CONFIG_TOKEN,
    ),
  ],
  providers: [],
})
export class FtpClientTestAppModule {}
