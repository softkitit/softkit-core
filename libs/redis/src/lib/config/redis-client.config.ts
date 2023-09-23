import { IsOptional, IsString } from 'class-validator';
import { RedisCommonConfig } from './redis-common.config';

export class RedisClientConfig extends RedisCommonConfig {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  namespace?: string;

  @IsString()
  @IsOptional()
  path?: string;
}
