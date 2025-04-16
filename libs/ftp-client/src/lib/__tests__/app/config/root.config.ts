import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FTPClientConfig } from '../../../config/ftp-client.config';

export class RootConfig {
  @ValidateNested()
  @IsObject()
  @Type(() => FTPClientConfig)
  defaultFTPClientConfig!: FTPClientConfig;

  @ValidateNested()
  @IsObject()
  @Type(() => FTPClientConfig)
  customTokenFTPClientConfig!: FTPClientConfig;

  @ValidateNested()
  @IsObject()
  @Type(() => FTPClientConfig)
  noAutoConnectFTPClientConfig!: FTPClientConfig;
}
