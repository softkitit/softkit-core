import { IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RetryType } from './vo/retry-type';

export class HttpRetryConfig {
  @IsNumber()
  @Type(() => Number)
  retriesCount = 3;

  @IsNumber()
  @Type(() => Number)
  delay = 1000;

  @IsEnum(RetryType)
  retryType: RetryType = RetryType.LINEAR;
}
