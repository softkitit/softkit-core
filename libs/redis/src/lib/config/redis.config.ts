import { ArrayMinSize, IsArray, IsBoolean } from 'class-validator';
import { BooleanType, ValidateNestedProperty } from '@softkit/validation';
import { RedisClientConfig } from './redis-client.config';
import { RedisCommonConfig } from './redis-common.config';

export class RedisConfig {
  @IsBoolean()
  @BooleanType
  readyLog = true;

  @IsBoolean()
  @BooleanType
  errorLog = true;

  /**
   * It's a common config that will be applied to each client
   * */
  @ValidateNestedProperty({ required: false, classType: RedisCommonConfig })
  commonConfig?: RedisCommonConfig;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNestedProperty({
    classType: RedisClientConfig,
    validationOptions: { each: true },
  })
  config!: RedisClientConfig[];
}
