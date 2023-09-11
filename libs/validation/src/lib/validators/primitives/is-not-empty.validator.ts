import {
  IS_NOT_EMPTY,
  isNotEmpty,
  IsNotEmpty,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

const MESSAGE = 'validation.NOT_EMPTY';

export const IsNotEmptyLocalized = (validationOptions?: ValidationOptions) =>
  IsNotEmpty({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsNotEmptyValidatorDefinition = {
  name: IS_NOT_EMPTY,
  validator: isNotEmpty,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsNotEmptyLocalized,
} satisfies IValidatorDefinition<string, undefined>;
