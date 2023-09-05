import { IsBoolean } from 'class-validator';
import { BooleanTypeTransform } from '@softkit/validation';

export class DbHealthConfig {
  @BooleanTypeTransform
  @IsBoolean()
  public enabled = true;
}
