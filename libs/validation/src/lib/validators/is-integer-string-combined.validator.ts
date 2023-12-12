import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { MaxLocalized, MinLocalized } from './primitives';
import { Transform } from 'class-transformer';
import { toInteger } from '../transforms/';
import { IsIntegerLocalized } from './primitives/is-int.validator';

export interface IsIntegerStringCombinedOptions {
  min?: number;
  max?: number;
  minValidationOptions?: ValidatorOptions;
  maxValidationOptions?: ValidatorOptions;
  numberValidationOptions?: ValidatorOptions;
}

/**
 * this useful for path variables and query params that are string by it's nature, but should be integer
 * the obvious example for this validator is pagination params for size and page number
 * */
export const IsIntegerStringCombinedLocalized = ({
  min,
  max,
  minValidationOptions = {},
  maxValidationOptions = {},
}: IsIntegerStringCombinedOptions = {}) => {
  const decorators = [
    IsIntegerLocalized(),
    Transform(toInteger),
    min ? MinLocalized(min, minValidationOptions) : undefined,
    max ? MaxLocalized(max, maxValidationOptions) : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
