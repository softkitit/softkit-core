import { IsNumber, IsString, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpRetryConfig } from './http-retry.config';
import { HttpCircuitBreakerConfig } from './http-circuit-breaker.config';
import { ValidateNestedProperty } from '@softkit/validation';

export class HttpClientConfig {
  @IsString()
  @IsUrl({
    require_tld: false,
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
   * timeout should account retries as well, it's time for the function invocation and not an individual request
   * */
  timeout = 10_000;

  @ValidateNestedProperty({ required: false, classType: HttpClientConfig })
  retryConfig?: HttpRetryConfig;

  @ValidateNestedProperty({
    required: false,
    classType: HttpCircuitBreakerConfig,
  })
  circuitBreakerConfig?: HttpCircuitBreakerConfig;
}
