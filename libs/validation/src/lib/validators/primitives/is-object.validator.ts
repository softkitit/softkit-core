import {
  IS_OBJECT,
  isObject,
  IsObject,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.OBJECT';

export const IsObjectLocalized = (validationOptions: ValidationOptions = {}) =>
  IsObject({
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsObjectValidatorDefinition = {
  name: IS_OBJECT,
  validator: isObject,
  defaultValidationMessage: MESSAGE,
  decorator: IsObjectLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
