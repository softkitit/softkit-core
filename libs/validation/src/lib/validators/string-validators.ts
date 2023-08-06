import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  Min,
  MaxLength,
  MinLength,
  IsUUID,
  IsEnum,
  IsOptional,
  Max,
  Allow,
} from 'class-validator';
import ValidatorJS from 'validator';
import { lowerCaseTransformer, toInteger } from '../transforms';

export const IsStringLocalized = () =>
  IsString({ message: 'common.validation.STRING' });

export const IsStringEnumLocalized = (enumType: object | string[]) => {
  const decorators = [
    IsEnum(enumType, { message: 'common.validation.STRING_ENUM' }),
  ].filter((v) => v !== undefined) as PropertyDecorator[];

  return applyDecorators(...decorators);
};

/**
 * this useful for path variables and query params that are string by it's nature, but should be integer
 * */
export const IsIntegerStringLocalized = ({
  required = true,
  min,
  max,
}: {
  required?: boolean;
  min?: number;
  max?: number;
} = {}) => {
  const decorators = [
    required ? Allow : IsOptional,
    Transform(toInteger),
    min === undefined
      ? undefined
      : Min(min, { message: 'common.validation.MIN_INTEGER' }),
    max === undefined
      ? undefined
      : Max(max, { message: 'common.validation.MAX_INTEGER' }),
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};

export const IsNotEmptyLocalized = () =>
  IsNotEmpty({
    message: 'common.validation.REQUIRED',
  });

export const IsRequiredStringLocalized = ({
  minLength,
  maxLength,
}: {
  minLength?: number;
  maxLength?: number;
} = {}) => {
  const decorators = [
    IsStringLocalized(),
    IsNotEmptyLocalized(),
    maxLength
      ? MaxLength(maxLength, { message: 'common.validation.MAX_STRING_LENGTH' })
      : undefined,
    minLength
      ? MinLength(minLength, { message: 'common.validation.MIN_STRING_LENGTH' })
      : undefined,
  ].filter((v) => v !== undefined) as PropertyDecorator[];

  return applyDecorators(...decorators);
};

export const IsUUIDLocalized = () => {
  const decorators = [
    IsStringLocalized(),
    IsUUID('4', {
      message: 'common.validation.UUID',
    }),
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
