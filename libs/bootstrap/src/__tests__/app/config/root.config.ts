import { AppConfig } from '../../../lib/config/app.config';
import { SwaggerConfig } from '@softkit/swagger-utils';
import { DbConfig } from '@softkit/typeorm';
import { LoggerConfig } from '@softkit/logger';
import { ValidateNestedProperty } from '@softkit/validation';

export class RootConfig {
  @ValidateNestedProperty({ classType: SwaggerConfig })
  swaggerConfig!: SwaggerConfig;

  @ValidateNestedProperty({ classType: DbConfig })
  db!: DbConfig;

  @ValidateNestedProperty({ classType: LoggerConfig })
  logs!: LoggerConfig;

  @ValidateNestedProperty({ classType: AppConfig })
  public readonly app!: AppConfig;
}
