import { IValidatorDefinition } from '../dynamic';
import {
  IsNumberString as IsNumberStringDecorator,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.IS_STRING_INTEGER';

export const IsIntegerString = (validationOptions: ValidationOptions = {}) => {
  return IsNumberStringDecorator(
    {
      no_symbols: true,
    },
    { message: i18n(MESSAGE), ...validationOptions },
  );
};

export const IsStringIntegerValidatorDefinition = {
  name: 'isStringInteger',
  validator: (value: string) => {
    if (value.length === 0) {
      return false;
    }

    // Check if the value is a valid integer
    return /^-?(?!0\d)\d+$/.test(value);
  },
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsIntegerString,
} satisfies IValidatorDefinition<string, undefined>;
