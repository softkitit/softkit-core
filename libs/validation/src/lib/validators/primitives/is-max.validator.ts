import { max, MAX, Max, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.MAX';

export const IsMaxLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Max(n, { message: i18nValidationMessage(MESSAGE), ...validationOptions });

export const IsMaxValidatorDefinition = {
  name: MAX,
  validator: max,
  defaultValidationMessage: MESSAGE,
  decorator: IsMaxLocalized,
} satisfies IValidatorDefinition<number, number>;
