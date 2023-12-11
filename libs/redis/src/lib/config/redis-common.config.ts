import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { BooleanType, IntegerType } from '@softkit/validation';

export class RedisCommonConfig {
  @IsInt()
  @Min(0)
  @IntegerType
  commandTimeout: number = 5000;

  @IsString()
  @IsOptional()
  host?: string;

  @IntegerType
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(65_535)
  port?: number;

  /**
   * Enable/disable keep-alive functionality.
   * @link https://nodejs.org/api/net.html#socketsetkeepaliveenable-initialdelay
   * @default 0
   */
  @IsInt()
  @Min(0)
  @IntegerType
  keepAlive: number = 0;

  /**
   * Enable/disable the use of Nagle's algorithm.
   * @link https://nodejs.org/api/net.html#socketsetnodelaynodelay
   * @default true
   */
  @IsBoolean()
  @BooleanType
  noDelay: boolean = true;

  /**
   * Set the name of the connection to make it easier to identity the connection
   * in client list.
   * @link https://redis.io/commands/client-setname
   */
  @MinLength(3)
  @IsString()
  @IsOptional()
  connectionName!: string;

  /**
   * If set, client will send AUTH command with the value of this option as the first argument when connected.
   * This is supported since Redis 6.
   */
  @IsString()
  @IsOptional()
  username?: string;
  /**
   * If set, client will send AUTH command with the value of this option when connected.
   */
  @IsString()
  @IsOptional()
  password?: string;

  /**
   * Redis databases are numbered from 0 to 15 and, by default, you connect to
   * database 0 when you connect to your Redis instance. However, you can change the database you're using with
   * the select command after you connect.
   * @default 0
   */
  @IsInt()
  @Min(0)
  @Max(15)
  @IntegerType
  db: number = 0;
  /**
   * When the client reconnects, channels subscribed in the previous connection will be
   * resubscribed automatically if `autoResubscribe` is `true`.
   * @default true
   */
  @IsBoolean()
  @BooleanType
  autoResubscribe: boolean = true;
  /**
   * Whether or not to resend unfulfilled commands on reconnect.
   * Unfulfilled commands are most likely to be blocking commands such as `brpop` or `blpop`.
   * @default true
   */
  @IsBoolean()
  @BooleanType
  autoResendUnfulfilledCommands: boolean = true;

  /**
   * @default false
   */
  @IsBoolean()
  @BooleanType
  readOnly: boolean = false;

  /**
   * When enabled, numbers returned by Redis will be converted to JavaScript strings instead of numbers.
   * This is necessary if you want to handle big numbers (above `Number.MAX_SAFE_INTEGER` === 2^53).
   * @default false
   */
  @IsBoolean()
  @BooleanType
  stringNumbers: boolean = false;

  /**
   * How long the client will wait before killing a socket due to inactivity during initial connection.
   * @default 10000
   */
  @IsInt()
  @Min(0)
  @IntegerType
  connectTimeout: number = 10_000;
  /**
   * This option is used internally when you call `redis.monitor()` to tell Redis
   * to enter the monitor mode when the connection is established.
   *
   * @default false
   */
  @IsBoolean()
  @BooleanType
  monitor: boolean = false;
  /**
   * The commands that don't get a reply due to the connection to the server is lost are
   * put into a queue and will be resent on reconnect (if allowed by the `retryStrategy` option).
   * This option is used to configure how many reconnection attempts should be allowed before
   * the queue is flushed with a `MaxRetriesPerRequestError` error.
   * Set this options to `null` instead of a number to let commands wait forever
   * until the connection is alive again.
   *
   * @default 20
   */

  @IsInt()
  @Min(0)
  @IntegerType
  @IsOptional()
  maxRetriesPerRequest: number | null = 20;

  /**
   * @default 10000
   */
  @IsInt()
  @Min(0)
  @IntegerType
  maxLoadingRetryTime: number = 10_000;

  /**
   * In auto pipelining mode, all commands issued during
   * an event loop are enqueued in a pipeline automatically managed by ioredis.
   * At the end of the iteration, the pipeline is executed and thus
   * all commands are sent to the server at the same time.
   * This feature can dramatically improve throughput and avoids HOL
   * blocking. In our benchmarks, the improvement was between 35% and 50%.
   * @default false
   */
  @IsBoolean()
  @BooleanType
  enableAutoPipelining: boolean = false;

  /**
   * @default []
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  autoPipeliningIgnoredCommands?: string[];

  /**
   *
   * By default, if the connection to Redis server has not been established, commands are added to a queue
   * and are executed once the connection is "ready" (when `enableReadyCheck` is true, "ready" means
   * the Redis server has loaded the database from disk, otherwise means the connection to the Redis
   * server has been established). If this option is false, when execute the command when the connection
   * isn't ready, an error will be returned.
   *
   * @default true
   */
  @IsBoolean()
  @BooleanType
  enableOfflineQueue: boolean = true;

  /**
   * The client will sent an INFO command to check whether the server is still loading data from the disk (
   * which happens when the server is just launched) when the connection is established, and only wait until
   * the loading process is finished before emitting the `ready` event.
   *
   * @default true
   */
  @IsBoolean()
  @BooleanType
  enableReadyCheck: boolean = true;

  /**
   * When a Redis instance is initialized, a connection to the server is immediately established. Set this to
   * true will delay the connection to the server until the first command is sent or `redis.connect()` is called
   * explicitly.
   *
   * @default false
   */
  @IsBoolean()
  @BooleanType
  lazyConnect: boolean = false;
}
