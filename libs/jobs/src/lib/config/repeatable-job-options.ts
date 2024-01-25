import { IsOptional, IsString } from 'class-validator';
import {
  BooleanType,
  IntegerType,
  IsBooleanLocalized,
  IsIntegerLocalized,
} from '@softkit/validation';

export class RepeatableJobOptions {
  @IsString()
  @IsOptional()
  pattern?: string;

  /**
   * Number of times the job should repeat at max.
   */
  @IsIntegerLocalized()
  @IntegerType
  @IsOptional()
  limit?: number;

  /**
   * Repeat after this amount of milliseconds
   * (`pattern` setting cannot be used together with this setting.)
   */
  @IsIntegerLocalized()
  @IntegerType
  @IsOptional()
  every?: number;

  /**
   * Repeated job should start right now
   * (work only with every settings)
   */
  @IsBooleanLocalized()
  @BooleanType
  @IsOptional()
  immediately?: boolean;

  /**
   * The start value for the repeat iteration count.
   */
  @IsIntegerLocalized()
  @IntegerType
  @IsOptional()
  count?: number;
}
