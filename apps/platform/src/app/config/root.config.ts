import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { SamlConfig } from './saml.config';
import { LoggerConfig } from '@softkit/logger';
import { AuthConfig } from '@softkit/auth';
import { SwaggerConfig } from '@softkit/swagger-utils';
import { I18Config } from '@softkit/i18n';
import { DbConfig } from '@softkit/typeorm';
import { AppConfig } from '@softkit/bootstrap';
import { HttpClientConfig } from '@softkit/server-http-client';
import { PlatformClientConfig } from '@softkit/platform-client';
import { HealthConfig } from '@softkit/healthcheck';

export default class RootConfig implements PlatformClientConfig {
  @Type(() => LoggerConfig)
  @ValidateNested()
  public readonly logs!: LoggerConfig;

  @Type(() => AuthConfig)
  @ValidateNested()
  public readonly auth!: AuthConfig;

  @Type(() => HttpClientConfig)
  @ValidateNested()
  public readonly platformClient!: HttpClientConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;

  @Type(() => SwaggerConfig)
  @ValidateNested()
  public readonly swagger!: SwaggerConfig;

  @Type(() => I18Config)
  @ValidateNested()
  public readonly i18!: I18Config;

  @Type(() => DbConfig)
  @ValidateNested()
  public readonly db!: DbConfig;

  @Type(() => HealthConfig)
  @ValidateNested()
  public readonly health!: HealthConfig;

  @Type(() => SamlConfig)
  @ValidateNested()
  public readonly saml!: SamlConfig;
}
