import { IValidatorDefinition } from '../dynamic';
import {
  IS_STRING,
  isString,
  IsString,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.STRING';

export const IsStringLocalized = (validationOptions?: ValidationOptions) =>
  IsString({ message: i18n(MESSAGE), ...validationOptions });

export const IsStringValidatorDefinition = {
  name: IS_STRING,
  validator: isString,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsStringLocalized,
} satisfies IValidatorDefinition<string, undefined>;
