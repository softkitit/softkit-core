import { IValidatorDefinition } from '../dynamic';
import { IS_URL, isURL, IsUrl, ValidationOptions } from 'class-validator';
import { i18n, i18nString } from '../../utils';
import { IsURLOptions } from 'validator/lib/isURL';

const MESSAGE = 'validation.URL';

export const IsUrlLocalized = (
  opt: IsURLOptions = {},
  validationOptions: ValidationOptions = {},
) => IsUrl(opt, { message: i18n(MESSAGE), ...validationOptions });

export const IsUrlValidatorDefinition = {
  name: IS_URL,
  validator: isURL,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsUrlLocalized,
} satisfies IValidatorDefinition<string, IsURLOptions>;
