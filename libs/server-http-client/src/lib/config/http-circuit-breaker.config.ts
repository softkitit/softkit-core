import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class HttpCircuitBreakerConfig {
  /**
   * The max number of milliseconds allowed for the external service to respond
   * to a request before the breaker considers it a failure.
   * @default 10000 (10 seconds)
   * */
  @IsNumber()
  @Type(() => Number)
  timeout = 10_000;

  /**
   * The time in milliseconds to wait before setting the breaker to `halfOpen` state, and trying the action again.
   * In other words, how long should we give an external service to recover
   * before we will continue making requests to it again
   * @default 30000 (30 seconds)
   */
  @IsNumber()
  @Type(() => Number)
  resetTimeout = 30_000;

  /**
   * Percentage of failed requests that will trip the circuit.
   * The circuit will trip open when the failure rate is equal or greater than this value.
   * @default 100 (100%), because we want to trip the circuit only if all requests are failing
   * because there can be dozens of reasons of failure and if there is a chance to get
   * a successful response we want to try it, unless it dead for everyone
   * */
  @IsNumber()
  @Type(() => Number)
  errorThresholdPercentage = 100;

  /**
   * Sets the duration of the statistical rolling window, in milliseconds.
   * This is how long we keep metrics for the circuit breaker to use and for publishing.
   * @default 10000 (10 seconds)
   */
  @IsNumber()
  @Type(() => Number)
  rollingCountTimeout = 10_000;

  /**
   * The minimum number of requests within the rolling statistical window that must exist before
   * the circuit breaker can open.
   * if the number of requests within the statistical window does not exceed
   * this threshold, the circuit will remain closed.
   * @default 0
   */
  @IsNumber()
  @Type(() => Number)
  volumeThreshold = 30;

  /**
   * The number of concurrent requests allowed.
   * If the number currently executing requests is equal to maxConcurrentRequests, further calls
   * are rejected until at least one of the current requests completes.
   * @default not limited
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxConcurrentRequests?: number;
}
