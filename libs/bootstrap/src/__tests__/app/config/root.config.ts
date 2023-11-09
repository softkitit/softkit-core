import { Type } from 'class-transformer';
import { AppConfig } from '../../../lib/config/app';
import { ValidateNested } from 'class-validator';
import { SwaggerConfig } from '@softkit/swagger-utils';
import { DbConfig } from '@softkit/typeorm';

export class RootConfig {
  @ValidateNested()
  @Type(() => SwaggerConfig)
  swaggerConfig!: SwaggerConfig;

  @ValidateNested()
  @Type(() => DbConfig)
  db!: DbConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;
}
