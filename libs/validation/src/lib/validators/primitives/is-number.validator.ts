import { IValidatorDefinition } from './validator-definition.interface';
import {
  IS_NUMBER,
  isNumber,
  IsNumber,
  IsNumberOptions,
  ValidationOptions,
} from 'class-validator';

const MESSAGE = 'common.validation.NUMBER';

export const IsNumberLocalized = (
  isNumberOptions: IsNumberOptions = {},
  validationOptions: ValidationOptions = {},
) => {
  return IsNumber(isNumberOptions, { message: MESSAGE, ...validationOptions });
};

export const IsNumberValidatorDefinition = {
  name: IS_NUMBER,
  validator: isNumber,
  defaultValidationMessage: MESSAGE,
  decorator: IsNumberLocalized,
} satisfies IValidatorDefinition<number, IsNumberOptions>;
