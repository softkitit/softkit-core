import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { RepeatableJobOptions } from './repeatable-job-options';

export class SystemJobConfig {
  @IsString()
  name!: string;

  @IsNumber()
  jobVersion!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RepeatableJobOptions)
  repeat!: RepeatableJobOptions;

  @Transform((j) => j.value)
  @IsObject()
  @IsOptional()
  jobData?: object;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultJobOptionsConfig)
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();
}
