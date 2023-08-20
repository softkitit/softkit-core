import { max, MAX, Max, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.MAX';

export const IsMaxLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Max(n, { message: i18n(MESSAGE), ...validationOptions });

export const IsMaxValidatorDefinition = {
  name: MAX,
  validator: max,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsMaxLocalized,
} satisfies IValidatorDefinition<number, number>;
