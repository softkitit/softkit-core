import { IValidatorDefinition } from './validator-definition.interface';
import {
  IsNumberString as IsNumberStringDecorator,
  ValidationOptions,
} from 'class-validator';

const MESSAGE = 'common.validation.IS_STRING_INTEGER';

export const IsIntegerString = (validationOptions: ValidationOptions = {}) => {
  return IsNumberStringDecorator(
    {
      no_symbols: true,
    },
    { message: MESSAGE, ...validationOptions },
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
  defaultValidationMessage: MESSAGE,
  decorator: IsIntegerString,
} satisfies IValidatorDefinition<string, undefined>;
