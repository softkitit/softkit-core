import { IS_ARRAY, isArray, IsArray, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.ARRAY';

export const IsArrayLocalized = (validationOptions: ValidationOptions = {}) =>
  IsArray({
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsArrayValidatorDefinition = {
  name: IS_ARRAY,
  validator: isArray,
  defaultValidationMessage: MESSAGE,
  decorator: IsArrayLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
