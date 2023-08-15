import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { IsNotEmptyLocalized, IsStringLocalized } from './primitives';
import { MaxLengthLocalized } from './primitives/is-max-length.validator';
import { MinLengthLocalized } from './primitives/is-min-length.validator';

export interface IsStringCombinedOptions {
  minLength?: number;
  maxLength?: number;
  notEmpty?: boolean;
  isNotEmptyValidationOptions?: ValidatorOptions;
  stringValidationOptions?: ValidatorOptions;
  minLengthValidationOptions?: ValidatorOptions;
  maxLengthValidationOptions?: ValidatorOptions;
}

export const IsStringCombinedLocalized = ({
  minLength,
  maxLength,
  notEmpty = true,
  stringValidationOptions = {},
  isNotEmptyValidationOptions = {},
  minLengthValidationOptions = {},
  maxLengthValidationOptions = {},
}: IsStringCombinedOptions = {}) => {
  const decorators = [
    IsStringLocalized(stringValidationOptions),
    notEmpty ? IsNotEmptyLocalized(isNotEmptyValidationOptions) : undefined,
    maxLength
      ? MaxLengthLocalized(maxLength, maxLengthValidationOptions)
      : undefined,
    minLength
      ? MinLengthLocalized(minLength, minLengthValidationOptions)
      : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
