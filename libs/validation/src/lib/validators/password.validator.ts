import { applyDecorators } from '@nestjs/common';
import { Matches, ValidatorOptions } from 'class-validator';
import { MaxLengthLocalized } from './primitives/is-max-length.validator';
import { MinLengthLocalized } from './primitives/is-min-length.validator';

export interface PasswordLocalizedOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minLengthValidationOptions?: ValidatorOptions;
  maxLengthValidationOptions?: ValidatorOptions;
  passwordValidationOptions?: ValidatorOptions;
}

export const PasswordLocalized = ({
  minLength = 8,
  maxLength = 128,
  pattern = /^(?=.*?[A-Za-z])(?=.*?\d)(?=.*?[!#$%&*?@^-]).{8,}$/,
  minLengthValidationOptions = {},
  maxLengthValidationOptions = {},
  passwordValidationOptions = {},
}: PasswordLocalizedOptions = {}) => {
  return applyDecorators(
    MinLengthLocalized(minLength, minLengthValidationOptions),
    MaxLengthLocalized(maxLength, maxLengthValidationOptions),
    Matches(pattern, {
      message: 'common.validation.PASSWORD_DOESNT_MATCH_CONSTRAINTS',
      ...passwordValidationOptions,
    }),
  );
};
