import { IValidatorDefinition } from '../dynamic';
import { IS_STRING, isInt, IsInt, ValidationOptions } from 'class-validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.INTEGER';

export const IsIntegerLocalized = (validationOptions?: ValidationOptions) =>
  IsInt({ message: i18n(MESSAGE), ...validationOptions });

export const IsIntegerValidatorDefinition = {
  name: IS_STRING,
  validator: isInt,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsIntegerLocalized,
} satisfies IValidatorDefinition<string, undefined>;
