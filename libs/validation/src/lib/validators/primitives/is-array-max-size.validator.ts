import {
  ARRAY_MAX_SIZE,
  ArrayMaxSize,
  arrayMaxSize,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.ARRAY_MAX_SIZE';

export const IsArrayMaxSizeLocalized = (
  max: number,
  validationOptions: ValidationOptions = {},
) =>
  ArrayMaxSize(max, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsArrayMaxSizeValidatorDefinition = {
  name: ARRAY_MAX_SIZE,
  validator: arrayMaxSize,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsArrayMaxSizeLocalized,
} satisfies IValidatorDefinition<unknown, number>;
