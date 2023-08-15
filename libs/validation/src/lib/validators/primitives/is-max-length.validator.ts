import {
  MAX_LENGTH,
  maxLength,
  MaxLength,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.MAX_LENGTH';

export const MaxLengthLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) =>
  MaxLength(n, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsMaxLengthValidatorDefinition = {
  name: MAX_LENGTH,
  validator: maxLength,
  defaultValidationMessage: MESSAGE,
  decorator: MaxLengthLocalized,
} satisfies IValidatorDefinition<string, number>;
