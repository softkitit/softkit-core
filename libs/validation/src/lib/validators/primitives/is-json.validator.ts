import { IS_JSON, isJSON, IsJSON, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.JSON';

export const IsJSONLocalized = (validationOptions: ValidationOptions = {}) =>
  IsJSON({
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsJSONValidatorDefinition = {
  name: IS_JSON,
  validator: isJSON,
  defaultValidationMessage: MESSAGE,
  decorator: IsJSONLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
