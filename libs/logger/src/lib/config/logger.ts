import { Allow, IsString, IsBoolean } from 'class-validator';

export default class LoggerConfig {

  @IsBoolean()
  @Allow()
  colorize = true;

  @IsBoolean()
  @Allow()
  prettyLogs = true;

  @IsString()
  @Allow()
  defaultLevel = 'info';

}
