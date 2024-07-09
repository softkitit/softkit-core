import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SwaggerConfig } from '@softkit/swagger-utils';

export class RootConfig {
  @Type(() => SwaggerConfig)
  @ValidateNested()
  public readonly swagger!: SwaggerConfig;
}
