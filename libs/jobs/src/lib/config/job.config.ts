import { IsOptional, IsString } from 'class-validator';
import { DefaultJobOptionsConfig } from './default-job-options.config';
import { JobOptions } from './job-options';
import { ValidateNestedProperty } from '@softkit/validation';

export class JobConfig {
  @IsString()
  name!: string;

  @IsOptional()
  @ValidateNestedProperty({ required: false, classType: JobOptions })
  options?: JobOptions;

  @IsOptional()
  @ValidateNestedProperty({
    required: false,
    classType: DefaultJobOptionsConfig,
  })
  defaultJobOptions: DefaultJobOptionsConfig = new DefaultJobOptionsConfig();
}
