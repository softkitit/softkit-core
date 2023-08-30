import { DiskHealthConfig } from './disk-health.config';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DbHealthConfig } from './db-health.config';

export class HealthConfig {
  @Type(() => DiskHealthConfig)
  @ValidateNested()
  public readonly disk!: DiskHealthConfig;

  @Type(() => DbHealthConfig)
  @ValidateNested()
  public readonly db!: DbHealthConfig;
}
