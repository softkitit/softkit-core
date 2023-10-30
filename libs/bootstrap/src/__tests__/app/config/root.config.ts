import { Type } from 'class-transformer';
import { AppConfig } from '../../../lib/config/app';
import { ValidateNested } from 'class-validator';
import { SwaggerConfig } from '@softkit/swagger-utils';

export class RootConfig {
  @ValidateNested()
  @Type(() => SwaggerConfig)
  swaggerConfig!: SwaggerConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;
}
