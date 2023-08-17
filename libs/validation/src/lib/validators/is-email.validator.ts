import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, ValidatorOptions } from 'class-validator';
import { trimAndLowercaseTransformer } from '../transforms/';
import { MaxLengthLocalized } from './primitives/is-max-length.validator';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

export interface IsEmailLocalizedOptions {
  maxLength?: number;
  trimAndLowercase?: boolean;
  maxLengthValidationOptions?: ValidatorOptions;
  emailValidationOptions?: ValidatorOptions;
}

export const IsEmailLocalized = ({
  maxLength = 320,
  trimAndLowercase = true,
  maxLengthValidationOptions = {},
  emailValidationOptions = {},
}: IsEmailLocalizedOptions = {}) => {
  const decorators = [
    trimAndLowercase ? Transform(trimAndLowercaseTransformer) : undefined,
    MaxLengthLocalized(maxLength, {
      ...maxLengthValidationOptions,
    }),
    IsEmail(
      {
        ignore_max_length: true,
        ...emailValidationOptions,
      },
      { message: i18nValidationMessage('common.validation.INVALID_EMAIL') },
    ),
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
