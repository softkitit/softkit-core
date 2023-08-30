import { IsBoolean } from 'class-validator';
import { BooleanTypeTransform } from '@saas-buildkit/validation';

export class DbHealthConfig {
  @BooleanTypeTransform
  @IsBoolean()
  public enabled = true;
}
