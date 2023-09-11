import { IValidatorDefinition } from '../dynamic';
import {
  IS_NUMBER,
  isNumber,
  IsNumber,
  IsNumberOptions,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.NUMBER';

export const IsNumberLocalized = (
  isNumberOptions: IsNumberOptions = {},
  validationOptions: ValidationOptions = {},
) => {
  return IsNumber(isNumberOptions, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });
};

export const IsNumberValidatorDefinition = {
  name: IS_NUMBER,
  validator: isNumber,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsNumberLocalized,
} satisfies IValidatorDefinition<number, IsNumberOptions>;
