import { IsString, IsBoolean } from 'class-validator';
import { BooleanType } from '@softkit/validation';

export class LoggerConfig {
  @IsBoolean()
  @BooleanType
  colorize: boolean = false;

  @IsBoolean()
  @BooleanType
  prettyLogs: boolean = false;

  @IsString()
  defaultLevel = 'info';
}
