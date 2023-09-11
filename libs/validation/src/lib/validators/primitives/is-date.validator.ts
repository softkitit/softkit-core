import { IValidatorDefinition } from '../dynamic';
import {
  IS_DATE_STRING,
  IsDateString,
  isDateString,
  ValidationOptions,
} from 'class-validator';
import ValidatorJS from 'validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.DATE';

export const IsDateLocalized = (
  dateOptions: ValidatorJS.IsISO8601Options = {},
  validationOptions: ValidationOptions = {},
) =>
  IsDateString(
    {
      ...dateOptions,
      strict: true,
      strictSeparator: true,
    },
    {
      message: i18n(MESSAGE),
      ...validationOptions,
    },
  );

export const IsDateValidatorDefinition = {
  name: IS_DATE_STRING,
  validator: isDateString,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsDateLocalized,
} satisfies IValidatorDefinition<string, ValidatorJS.IsISO8601Options>;
