import { applyDecorators } from '@nestjs/common';
import { IsEmail, ValidationOptions } from 'class-validator';
import { TrimAndLowercase } from '../transforms/';
import { MaxLengthLocalized } from './primitives';
import { i18nValidationMessage } from '@softkit/i18n';
import { IsEmailOptions } from 'validator/lib/isEmail';

export interface IsEmailLocalizedOptions {
  maxLength?: number;
  trimAndLowercase?: boolean;
  maxLengthValidationOptions?: ValidationOptions;
  isEmailOptions?: IsEmailOptions;
  emailValidationOptions?: ValidationOptions;
}

export const IsEmailLocalized = ({
  maxLength = 320,
  trimAndLowercase = true,
  maxLengthValidationOptions = {},
  isEmailOptions = {},
  emailValidationOptions = {},
}: IsEmailLocalizedOptions = {}) => {
  const decorators = [
    trimAndLowercase ? TrimAndLowercase : undefined,
    MaxLengthLocalized(maxLength, {
      ...maxLengthValidationOptions,
    }),
    IsEmail(
      {
        ignore_max_length: true,
        ...isEmailOptions,
      },
      {
        ...emailValidationOptions,
        message: i18nValidationMessage('validation.INVALID_EMAIL'),
      },
    ),
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
