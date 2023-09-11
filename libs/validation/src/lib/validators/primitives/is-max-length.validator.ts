import {
  MAX_LENGTH,
  maxLength,
  MaxLength,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.MAX_STRING_LENGTH';

export const MaxLengthLocalized = (
  n: number,
  validationOptions?: ValidationOptions,
) =>
  MaxLength(n, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsMaxLengthValidatorDefinition = {
  name: MAX_LENGTH,
  validator: maxLength,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MaxLengthLocalized,
} satisfies IValidatorDefinition<string, number>;
