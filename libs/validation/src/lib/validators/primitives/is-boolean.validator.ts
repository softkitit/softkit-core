import {
  IS_BOOLEAN,
  isBoolean,
  IsBoolean,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.BOOLEAN';

export const IsBooleanLocalized = (validationOptions: ValidationOptions = {}) =>
  IsBoolean({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsBooleanValidatorDefinition = {
  name: IS_BOOLEAN,
  validator: isBoolean,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsBooleanLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
