import { IntegerType, IsIntegerLocalized } from '@softkit/validation';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RedisLockConfig {
  // The expected clock drift; for more details see:
  // http://redis.io/topics/distlock
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  driftFactor: number = 0.01; // multiplied by lock ttl to determine drift time

  // The max number of attempts to lock a resource
  // before error.
  @IsIntegerLocalized()
  @IntegerType
  @Min(0)
  retryCount: number = 10;

  // the time in ms between attempts
  @IsIntegerLocalized()
  @IntegerType
  @Min(0)
  retryDelay: number = 200;

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  @IsIntegerLocalized()
  @IntegerType
  @Min(0)
  retryJitter: number = 200;

  // The minimum remaining time on a lock before an extension is automatically
  // attempted with the `using` API.
  @IsIntegerLocalized()
  @IntegerType
  @Min(0)
  automaticExtensionThreshold: number = 500;

  // Default lock duration to use in decorator
  @IsIntegerLocalized()
  @IntegerType
  @Min(0)
  defaultDecoratorLockDuration: number = 1000;
}
