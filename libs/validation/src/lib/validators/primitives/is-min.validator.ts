import { IValidatorDefinition } from '../dynamic';
import { MIN, min, Min, ValidationOptions } from 'class-validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.MIN';

export const MinLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Min(n, { message: i18n(MESSAGE), ...validationOptions });

export const MinValidatorDefinition = {
  name: MIN,
  validator: min,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MinLocalized,
} satisfies IValidatorDefinition<string, number>;
