import { RepeatableJobOptions } from './repeatable-job-options';
import { IsOptional } from 'class-validator';
import {
  BooleanType,
  IsBooleanLocalized,
  ValidateNestedProperty,
} from '@softkit/validation';

export class JobOptions {
  @ValidateNestedProperty({ required: false, classType: RepeatableJobOptions })
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
