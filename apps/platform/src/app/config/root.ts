import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { SamlConfig } from './saml';
import { LoggerConfig } from "@saas-buildkit/logger";
import { AuthConfig } from "@saas-buildkit/auth";
import { SwaggerConfig } from "@saas-buildkit/swagger-utils";
import { I18Config } from "@saas-buildkit/i18n";
import { DbConfig } from "@saas-buildkit/typeorm";
import { AppConfig } from "@saas-buildkit/bootstrap";

export default class RootConfig {
  @Type(() => LoggerConfig)
  @ValidateNested()
  public readonly logs!: LoggerConfig;

  @Type(() => AuthConfig)
  @ValidateNested()
  public readonly auth!: AuthConfig;

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

  @Type(() => SamlConfig)
  @ValidateNested()
  public readonly saml!: SamlConfig;
}
