import { IValidatorDefinition } from './validator-definition.interface';
import { IS_URL, isURL, IsUrl, ValidationOptions } from 'class-validator';
import ValidatorJS from 'validator';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.URL';

export const IsUrlLocalized = (
  opt: ValidatorJS.IsURLOptions = {},
  validationOptions: ValidationOptions = {},
) =>
  IsUrl(opt, { message: i18nValidationMessage(MESSAGE), ...validationOptions });

export const IsUrlValidatorDefinition = {
  name: IS_URL,
  validator: isURL,
  defaultValidationMessage: MESSAGE,
  decorator: IsUrlLocalized,
} satisfies IValidatorDefinition<string, ValidatorJS.IsURLOptions>;
