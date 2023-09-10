import { IsBoolean } from 'class-validator';
import { BooleanType } from '@softkit/validation';

export class DbHealthConfig {
  @BooleanType
  @IsBoolean()
  public enabled = true;
}
