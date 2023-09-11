import { IS_JSON, isJSON, IsJSON, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.JSON';

export const IsJSONLocalized = (validationOptions: ValidationOptions = {}) =>
  IsJSON({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsJSONValidatorDefinition = {
  name: IS_JSON,
  validator: isJSON,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsJSONLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
