import {
  ARRAY_NOT_EMPTY,
  ArrayNotEmpty,
  arrayNotEmpty,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.NOT_EMPTY_ARRAY';

export const NotEmptyArrayLocalized = (
  validationOptions: ValidationOptions = {},
) =>
  ArrayNotEmpty({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const NotEmptyArrayValidatorDefinition = {
  name: ARRAY_NOT_EMPTY,
  validator: arrayNotEmpty,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: NotEmptyArrayLocalized,
} satisfies IValidatorDefinition<unknown, undefined>;
