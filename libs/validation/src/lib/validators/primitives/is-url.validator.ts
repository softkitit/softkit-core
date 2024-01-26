import { IValidatorDefinition } from '../dynamic';
import { IS_URL, isURL, IsUrl, ValidationOptions } from 'class-validator';
import * as ValidatorJS from 'validator';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.URL';

export const IsUrlLocalized = (
  opt: ValidatorJS.IsURLOptions = {},
  validationOptions: ValidationOptions = {},
) => IsUrl(opt, { message: i18n(MESSAGE), ...validationOptions });

export const IsUrlValidatorDefinition = {
  name: IS_URL,
  validator: isURL,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsUrlLocalized,
} satisfies IValidatorDefinition<string, ValidatorJS.IsURLOptions>;
