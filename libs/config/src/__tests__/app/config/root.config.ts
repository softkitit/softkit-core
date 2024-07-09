import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SwaggerConfig } from './test-swagger.config';

export class RootConfig {
  @Type(() => SwaggerConfig)
  @ValidateNested()
  public readonly swagger!: SwaggerConfig;
}
