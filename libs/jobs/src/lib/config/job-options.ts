import { RepeatableJobOptions } from './repeatable-job-options';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BooleanType, IsBooleanLocalized } from '@softkit/validation';

export class JobOptions {
  @IsOptional()
  @ValidateNested()
  @Type(/* istanbul ignore next */ () => RepeatableJobOptions)
  @IsObject()
  repeat?: RepeatableJobOptions;

  @BooleanType
  @IsBooleanLocalized()
  @IsOptional()
  failParentOnFailure?: boolean;

  /**
   * If true, removes the job from its parent dependencies when it fails after all attempts.
   */
  @BooleanType
  @IsBooleanLocalized()
  @IsOptional()
  removeDependencyOnFailure?: boolean;
}
