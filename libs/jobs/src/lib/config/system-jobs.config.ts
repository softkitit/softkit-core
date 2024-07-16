import { IsArray, IsInt } from 'class-validator';
import { IntegerType, ValidateNestedProperty } from '@softkit/validation';
import { SystemJobConfig } from './system-job.config';

export class SystemJobsConfig {
  @IntegerType
  @IsInt()
  systemJobLockTimeoutMillis: number = 15_000;

  @IsArray()
  @ValidateNestedProperty({
    required: false,
    classType: SystemJobConfig,
    validationOptions: { each: true },
  })
  jobs?: SystemJobConfig[];
}
