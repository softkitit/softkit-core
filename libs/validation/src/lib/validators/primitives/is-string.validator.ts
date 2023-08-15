import { IValidatorDefinition } from './validator-definition.interface';
import {
  IS_STRING,
  isString,
  IsString,
  ValidationOptions,
} from 'class-validator';

const MESSAGE = 'common.validation.STRING';

export const IsStringLocalized = (validationOptions: ValidationOptions = {}) =>
  IsString({ message: MESSAGE, ...validationOptions });

export const IsStringValidatorDefinition = {
  name: IS_STRING,
  validator: isString,
  defaultValidationMessage: MESSAGE,
  decorator: IsStringLocalized,
} satisfies IValidatorDefinition<string, undefined>;
