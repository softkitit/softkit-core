import { IsBoolean, IsNumber, IsString, Max, Min } from 'class-validator';
import { BooleanTypeTransform } from '@softkit/validation';

export class DiskHealthConfig {
  @IsString()
  public path = '/';

  @IsNumber()
  @Max(1)
  @Min(0)
  public thresholdPercent = 0.8;

  @BooleanTypeTransform
  @IsBoolean()
  public enabled = true;
}
