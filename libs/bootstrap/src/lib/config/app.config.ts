import {
  Allow,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CorsConfig } from './cors.config';

export class AppConfig {
  @IsInt()
  @Min(0)
  @Max(65_535)
  port!: number;

  @IsString()
  @Allow()
  prefix?: string;

  @Type(() => CorsConfig)
  @ValidateNested()
  public readonly cors!: CorsConfig;
}
