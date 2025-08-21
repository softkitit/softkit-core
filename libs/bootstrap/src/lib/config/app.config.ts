import { Allow, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CorsConfig } from './cors.config';
import { ValidateNestedProperty } from '@softkit/validation';
import { RequestConfig } from './request.config';

export class AppConfig {
  @IsInt()
  @Min(0)
  @Max(65_535)
  port!: number;

  @IsString()
  @Allow()
  prefix?: string;

  @ValidateNestedProperty({ classType: CorsConfig })
  public readonly cors!: CorsConfig;

  @IsOptional()
  @ValidateNestedProperty({ classType: RequestConfig })
  public readonly request?: RequestConfig;
}
