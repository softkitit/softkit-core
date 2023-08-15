import { IValidatorDefinition } from './validator-definition.interface';
import {
  IS_DATE_STRING,
  IsDateString,
  isDateString,
  ValidationOptions,
} from 'class-validator';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';
import ValidatorJS from 'validator';

const MESSAGE = 'common.validation.DATE';

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
      message: i18nValidationMessage(MESSAGE),
      ...validationOptions,
    },
  );

export const IsDateValidatorDefinition = {
  name: IS_DATE_STRING,
  validator: isDateString,
  defaultValidationMessage: MESSAGE,
  decorator: IsDateLocalized,
} satisfies IValidatorDefinition<string, ValidatorJS.IsISO8601Options>;
