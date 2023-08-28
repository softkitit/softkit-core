import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HttpRetryConfig } from './http-retry.config';
import { HttpCircuitBreakerConfig } from './http-circuit-breaker.config';

export class HttpClientConfig {
  @IsString()
  @IsUrl({
    require_protocol: true,
    require_host: true,
    protocols: ['http', 'https'],
  })
  url!: string;

  @IsString()
  serviceName!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  /**
   * milliseconds to wait for the server to send the response before aborting the request
   * */
  timeout = 10_000;

  @Type(() => HttpRetryConfig)
  @ValidateNested()
  @IsOptional()
  retryConfig?: HttpRetryConfig;

  @Type(() => HttpCircuitBreakerConfig)
  @ValidateNested()
  @IsOptional()
  circuitBreakerConfig?: HttpCircuitBreakerConfig;
}
