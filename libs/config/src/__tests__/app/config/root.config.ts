import { SwaggerConfig } from './test-swagger.config';
import { ValidateNestedProperty } from '@softkit/validation';

export class RootConfig {
  @ValidateNestedProperty({ classType: SwaggerConfig })
  public readonly swagger!: SwaggerConfig;
}
