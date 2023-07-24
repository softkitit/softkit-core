import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import ValidatorJS from 'validator';
import { lowerCaseTransformer } from "../transforms";

export const IsRequiredStringLocalized = ({
  minLength,
  maxLength,
}: {
  minLength?: number;
  maxLength?: number;
} = {}) => {
  const decorators = [
    IsString({ message: 'common.validation.STRING' }),
    IsNotEmpty({
      message: 'common.validation.REQUIRED',
    }),
    maxLength
      ? MaxLength(maxLength, { message: 'common.validation.MAX_STRING_LENGTH' })
      : undefined,
    minLength
      ? MinLength(minLength, { message: 'common.validation.MIN_STRING_LENGTH' })
      : undefined,
  ].filter((v) => v !== undefined) as PropertyDecorator[];

  return applyDecorators(...decorators);
};

export const IsUrlLocalized = (
  urlOptions?: ValidatorJS.IsURLOptions,
  required = true,
) => {
  const decorators = [
    IsString({ message: 'common.validation.STRING' }),
    required
      ? IsNotEmpty({
          message: 'common.validation.REQUIRED',
        })
      : undefined,
    IsUrl(urlOptions, {
      message: 'common.validation.URL',
    }),
  ].filter((v) => v !== undefined) as PropertyDecorator[];

  return applyDecorators(...decorators);
};

const passwordValidationPattern =
  /^(?=.*?[A-Za-z])(?=.*?\d)(?=.*?[!#$%&*?@^-]).{8,}$/;
export const PasswordLocalized = () =>
  applyDecorators(
    IsRequiredStringLocalized({
      maxLength: 256,
    }),
    Matches(passwordValidationPattern, {
      message: 'common.validation.PASSWORD_DOESNT_MATCH_CONSTRAINTS',
    }),
  );

export const IsEmailLocalized = () =>
  applyDecorators(
    Transform(lowerCaseTransformer),
    MaxLength(320, { message: 'common.validation.MAX_STRING_LENGTH' }),
    IsEmail(
      {
        ignore_max_length: true,
      },
      { message: 'common.validation.INVALID_EMAIL' },
    ),
  );
