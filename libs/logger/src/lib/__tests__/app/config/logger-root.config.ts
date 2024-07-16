import { LoggerConfig } from '../../../config/logger';
import { ValidateNestedProperty } from '@softkit/validation';

export class LoggerRootConfig {
  @ValidateNestedProperty({ classType: LoggerConfig })
  logger!: LoggerConfig;
}
