import { Type } from 'class-transformer';
import { AppConfig } from '../../../lib/config/app.config';
import { ValidateNested } from 'class-validator';
import { SwaggerConfig } from '@softkit/swagger-utils';
import { DbConfig } from '@softkit/typeorm';
import { LoggerConfig } from '@softkit/logger';

export class RootConfig {
  @ValidateNested()
  @Type(() => SwaggerConfig)
  swaggerConfig!: SwaggerConfig;

  @ValidateNested()
  @Type(() => DbConfig)
  db!: DbConfig;

  @ValidateNested()
  @Type(() => LoggerConfig)
  logs!: LoggerConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;
}
