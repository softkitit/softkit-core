import { IS_ARRAY, isArray, IsArray, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.ARRAY';

export const IsArrayLocalized = (validationOptions: ValidationOptions = {}) =>
  IsArray({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsArrayValidatorDefinition = {
  name: IS_ARRAY,
  validator: isArray,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsArrayLocalized,
} satisfies IValidatorDefinition<unknown, undefined>;
