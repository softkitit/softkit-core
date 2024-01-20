import { IsNumber, IsObject, IsString } from 'class-validator';
import { JobConfig } from './job.config';
import { Transform } from 'class-transformer';

export class SystemJobConfig extends JobConfig {
  @IsString()
  cron!: string;

  @IsNumber()
  jobVersion!: number;

  @Transform((j) => j.value)
  @IsObject()
  jobData!: object;
}
