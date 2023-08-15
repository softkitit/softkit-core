import { IValidatorDefinition } from './validator-definition.interface';
import { MIN, min, Min, ValidationOptions } from 'class-validator';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.MIN';

export const MinLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Min(n, { message: i18nValidationMessage(MESSAGE), ...validationOptions });

export const MinValidatorDefinition = {
  name: MIN,
  validator: min,
  defaultValidationMessage: MESSAGE,
  decorator: MinLocalized,
} satisfies IValidatorDefinition<string, number>;
