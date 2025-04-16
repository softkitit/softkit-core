import { IFTPClientConfig } from './ftp-client-config.interface';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsBoolean,
  Max,
} from 'class-validator';
import { BooleanType, IntegerType } from '@softkit/validation';

export class FTPClientConfig implements IFTPClientConfig {
  /** Host the client should connect to. Optional, default is "localhost". */
  @IsString()
  @IsOptional()
  host?: string;

  /** Port the client should connect to. Optional, default is 21. */
  @Min(1)
  @Max(65_536)
  @IntegerType
  @IsOptional()
  port?: number;

  /** Client connection timeout, default is 30000 */
  @IsNumber()
  @IntegerType
  @Min(100, {
    message:
      'Timeout is in milliseconds, 100 milliseconds is a minimum value to prevent errors in case of slow connections',
  })
  @IsOptional()
  timeout?: number;

  /** Username to use for login. Optional, default is "anonymous". */
  @IsString()
  @IsOptional()
  user?: string;

  /** Password to use for login. Optional, default is "guest". */
  @IsString()
  @IsOptional()
  password?: string;

  /**
   * Use FTPS over TLS. Optional, default is false.
   * True is preferred explicit TLS,
   * "implicit" supports legacy, non-standardized implicit TLS.
   * */
  @IsBoolean()
  @BooleanType
  @IsOptional()
  secure?: boolean;

  /**
   * whether to connect to server using an access method on an application startup,
   * or library user will do it on it own in ModuleInit method
   * */
  @IsBoolean()
  @BooleanType
  @IsOptional()
  connectOnStartup: boolean = true;
}
