import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { RepeatableJobOptions } from './repeatable-job-options';
import { ValidateNestedProperty } from '@softkit/validation';

export class SystemJobConfig {
  @IsString()
  name!: string;

  @IsNumber()
  jobVersion!: number;

  @ValidateNestedProperty({ classType: RepeatableJobOptions })
  repeat!: RepeatableJobOptions;

  @Transform((j) => j.value)
  @IsObject()
  @IsOptional()
  jobData?: object;

  @IsOptional()
  @ValidateNestedProperty({
    required: false,
    classType: DefaultJobOptionsConfig,
  })
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();
}
