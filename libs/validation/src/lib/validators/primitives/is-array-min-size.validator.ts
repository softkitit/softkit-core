import {
  ARRAY_MIN_SIZE,
  arrayMinSize,
  ArrayMinSize,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.ARRAY_MIN_SIZE';

export const IsArrayMinSizeLocalized = (
  min: number,
  validationOptions: ValidationOptions = {},
) =>
  ArrayMinSize(min, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsArrayMinSizeValidatorDefinition = {
  name: ARRAY_MIN_SIZE,
  validator: arrayMinSize,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsArrayMinSizeLocalized,
} satisfies IValidatorDefinition<unknown, number>;
