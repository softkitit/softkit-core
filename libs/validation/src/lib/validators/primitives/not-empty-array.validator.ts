import {
  ARRAY_NOT_EMPTY,
  ArrayNotEmpty,
  arrayNotEmpty,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.NOT_EMPTY_ARRAY';

export const NotEmptyArrayLocalized = (
  validationOptions: ValidationOptions = {},
) =>
  ArrayNotEmpty({
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsArrayValidatorDefinition = {
  name: ARRAY_NOT_EMPTY,
  validator: arrayNotEmpty,
  defaultValidationMessage: MESSAGE,
  decorator: NotEmptyArrayLocalized,
} satisfies IValidatorDefinition<unknown, undefined>;
