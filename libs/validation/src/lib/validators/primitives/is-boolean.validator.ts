import {
  IS_BOOLEAN,
  isBoolean,
  IsBoolean,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.BOOLEAN';

export const IsBooleanLocalized = (validationOptions: ValidationOptions = {}) =>
  IsBoolean({
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsBooleanValidatorDefinition = {
  name: IS_BOOLEAN,
  validator: isBoolean,
  defaultValidationMessage: MESSAGE,
  decorator: IsBooleanLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
