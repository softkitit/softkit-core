import {
  MIN_LENGTH,
  minLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.MIN_LENGTH';

export const MinLengthLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) =>
  MinLength(n, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const MinValidatorDefinition = {
  name: MIN_LENGTH,
  validator: minLength,
  defaultValidationMessage: MESSAGE,
  decorator: MinLengthLocalized,
} satisfies IValidatorDefinition<string, number>;
