import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoggerConfig } from '../../../config/logger';

export class LoggerRootConfig {
  @ValidateNested()
  @Type(() => LoggerConfig)
  logger!: LoggerConfig;
}
